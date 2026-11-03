use aws_lambda_events::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use aws_lambda_events::http::HeaderMap;
use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde_json::Value;

async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let mut headers = HeaderMap::new();
    headers.insert("content-type", "application/json".parse().unwrap());

    let body_str = event.payload.body.unwrap_or_default();
    let payload: Value = serde_json::from_str(&body_str).unwrap_or_else(|_| serde_json::json!({}));

    let entry_id = payload
        .get("sys")
        .and_then(|s| s.get("id"))
        .and_then(|id| id.as_str())
        .unwrap_or("unknown");

    let algolia_app_id = std::env::var("NEXT_PUBLIC_ALGOLIA_APP_ID").ok();
    let algolia_admin_key = std::env::var("ALGOLIA_ADMIN_API_KEY").ok();
    let algolia_index = std::env::var("NEXT_PUBLIC_ALGOLIA_INDEX_NAME")
        .unwrap_or_else(|_| "stillage_products".to_string());

    if let (Some(app_id), Some(admin_key)) = (algolia_app_id, algolia_admin_key) {
        let url = format!(
            "https://{}-dsn.algolia.net/1/indexes/{}/{}",
            app_id, algolia_index, entry_id
        );
        let client = reqwest::Client::new();
        let _ = client
            .put(&url)
            .header("X-Algolia-Application-Id", app_id)
            .header("X-Algolia-API-Key", admin_key)
            .json(&payload)
            .send()
            .await;
    }

    Ok(ApiGatewayProxyResponse {
        status_code: 200,
        headers,
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::Text(
            serde_json::json!({
                "status": "indexed",
                "entryId": entry_id,
                "index": algolia_index,
                "engine": "rust-algolia-webhook-v1"
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
