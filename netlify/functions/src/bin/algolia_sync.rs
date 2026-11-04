use aws_lambda_events::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use aws_lambda_events::http::HeaderMap;
use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde_json::{json, Value};

fn unwrap_localized(field: Option<&Value>) -> Value {
    match field {
        Some(Value::Object(map)) => {
            if let Some(v) = map.get("en-US") {
                return v.clone();
            }
            if let Some(v) = map.get("en-GB") {
                return v.clone();
            }
            if let Some((_, first)) = map.iter().next() {
                return first.clone();
            }
            Value::Null
        }
        Some(v) => v.clone(),
        None => Value::Null,
    }
}

fn normalize_payload(payload: &Value, entry_id: &str) -> Value {
    let fields = payload.get("fields").unwrap_or(payload);
    let length = unwrap_localized(fields.get("externalLengthMm"))
        .as_i64()
        .unwrap_or(1200);
    let width = unwrap_localized(fields.get("externalWidthMm"))
        .as_i64()
        .unwrap_or(1000);
    let height = unwrap_localized(fields.get("externalHeightMm"))
        .as_i64()
        .unwrap_or(900);

    let footprint_mm = format!("{}x{}", length, width);
    let dimensions_text = format!("{}x{}x{}mm", length, width, height);

    json!({
        "objectID": entry_id,
        "id": entry_id,
        "title": unwrap_localized(fields.get("title")),
        "slug": unwrap_localized(fields.get("slug")),
        "sku": unwrap_localized(fields.get("sku")),
        "categorySlug": unwrap_localized(fields.get("categorySlug")),
        "categoryName": unwrap_localized(fields.get("categoryName")),
        "shortDescription": unwrap_localized(fields.get("shortDescription")),
        "fullDescription": unwrap_localized(fields.get("fullDescription")),
        "basePriceExVatPence": unwrap_localized(fields.get("basePriceExVatPence")),
        "swlKg": unwrap_localized(fields.get("swlKg")),
        "externalLengthMm": length,
        "externalWidthMm": width,
        "externalHeightMm": height,
        "footprintMm": footprint_mm,
        "dimensionsText": dimensions_text,
        "unitWeightKg": unwrap_localized(fields.get("unitWeightKg")),
        "stackableHeight": unwrap_localized(fields.get("stackableHeight")),
        "steelSpecification": unwrap_localized(fields.get("steelSpecification")),
        "standardFinish": unwrap_localized(fields.get("standardFinish")),
        "ukcaCertified": unwrap_localized(fields.get("ukcaCertified")),
        "inStock": unwrap_localized(fields.get("inStock")),
        "leadTimeText": unwrap_localized(fields.get("leadTimeText")),
        "featured": unwrap_localized(fields.get("featured")),
        "primaryImage": unwrap_localized(fields.get("primaryImage")),
        "secondaryImage": unwrap_localized(fields.get("secondaryImage")),
        "backdropStyle": unwrap_localized(fields.get("backdropStyle")),
        "highlights": unwrap_localized(fields.get("highlights")),
    })
}

async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let mut headers = HeaderMap::new();
    headers.insert("content-type", "application/json".parse().unwrap());

    let body_str = event.payload.body.unwrap_or_default();
    let payload: Value = serde_json::from_str(&body_str).unwrap_or_else(|_| json!({}));

    let entry_id = payload
        .get("sys")
        .and_then(|s| s.get("id"))
        .and_then(|id| id.as_str())
        .or_else(|| payload.get("id").and_then(|id| id.as_str()))
        .unwrap_or("unknown");

    let normalized = normalize_payload(&payload, entry_id);

    let algolia_app_id = std::env::var("NEXT_PUBLIC_ALGOLIA_APP_ID").ok();
    let algolia_admin_key = std::env::var("ALGOLIA_ADMIN_API_KEY").ok();
    let algolia_index = std::env::var("NEXT_PUBLIC_ALGOLIA_INDEX_NAME")
        .unwrap_or_else(|_| "stillage_products".to_string());

    if let (Some(app_id), Some(admin_key)) = (algolia_app_id, algolia_admin_key) {
        let url = format!(
            "https://{}.algolia.net/1/indexes/{}/{}",
            app_id, algolia_index, entry_id
        );
        let client = reqwest::Client::new();
        let _ = client
            .put(&url)
            .header("X-Algolia-Application-Id", app_id)
            .header("X-Algolia-API-Key", admin_key)
            .json(&normalized)
            .send()
            .await;
    }

    Ok(ApiGatewayProxyResponse {
        status_code: 200,
        headers,
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::Text(
            json!({
                "status": "indexed",
                "entryId": entry_id,
                "footprintMm": normalized.get("footprintMm"),
                "index": algolia_index,
                "engine": "rust-algolia-webhook-v2"
            })
            .to_string(),
        )),
        is_base64_encoded: false,
    })
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(handler)).await
}
