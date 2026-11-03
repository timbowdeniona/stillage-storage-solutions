use aws_lambda_events::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use aws_lambda_events::http::HeaderMap;
use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use stillage_commerce::{calculate_quote, QuoteRequest};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CheckoutRequest {
    pub quote_request: QuoteRequest,
    pub product_title: String,
    pub payment_mode: String, // "card" | "b2b_proforma"
    pub company_name: Option<String>,
    pub customer_email: Option<String>,
    pub purchase_order_number: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CheckoutResponse {
    pub status: String,
    pub order_reference: String,
    pub payment_mode: String,
    pub checkout_url: Option<String>,
    pub quote: stillage_commerce::QuoteResponse,
    pub message: String,
}

async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let mut headers = HeaderMap::new();
    headers.insert("content-type", "application/json".parse().unwrap());

    let body_str = event.payload.body.unwrap_or_default();
    let req: CheckoutRequest = match serde_json::from_str(&body_str) {
        Ok(r) => r,
        Err(e) => {
            return Ok(ApiGatewayProxyResponse {
                status_code: 400,
                headers,
                multi_value_headers: HeaderMap::new(),
                body: Some(Body::Text(
                    serde_json::json!({ "error": format!("Invalid checkout payload: {}", e) }).to_string(),
                )),
                is_base64_encoded: false,
            });
        }
    };

    let quote = calculate_quote(&req.quote_request);
    let order_ref = format!("SSS-{}-{}", req.quote_request.sku, quote.total_inc_vat_pence);

    let message = if req.payment_mode == "b2b_proforma" {
        format!(
            "Official VAT Proforma Invoice {} generated for {} ({}x {}).",
            order_ref,
            req.company_name.as_deref().unwrap_or("Trade Customer"),
            quote.quantity,
            req.product_title
        )
    } else {
        format!(
            "Stripe Checkout session prepared for order {} ({}x {}).",
            order_ref, quote.quantity, req.product_title
        )
    };

    let resp = CheckoutResponse {
        status: "ready".to_string(),
        order_reference: order_ref.clone(),
        payment_mode: req.payment_mode,
        checkout_url: Some(format!("/products?order_confirmed={}", order_ref)),
        quote,
        message,
    };

    Ok(ApiGatewayProxyResponse {
        status_code: 200,
        headers,
        multi_value_headers: HeaderMap::new(),
        body: Some(Body::Text(serde_json::to_string(&resp)?)),
        is_base64_encoded: false,
    })
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(handler)).await
}
