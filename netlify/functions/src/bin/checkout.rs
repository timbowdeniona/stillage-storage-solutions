use aws_lambda_events::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use aws_lambda_events::http::HeaderMap;
use lambda_runtime::{service_fn, Error, LambdaEvent};
use serde::{Deserialize, Serialize};
use std::env;
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
    pub session_id: Option<String>,
    pub client_secret: Option<String>,
    pub hosted_invoice_url: Option<String>,
    pub invoice_pdf_url: Option<String>,
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
    let stripe_secret = env::var("STRIPE_SECRET_KEY").unwrap_or_default();

    let mut session_id: Option<String> = None;
    let mut client_secret: Option<String> = None;
    let mut hosted_invoice_url: Option<String> = None;
    let mut invoice_pdf_url: Option<String> = None;

    if !stripe_secret.is_empty() && stripe_secret != "sk_test_your_stripe_secret_key" && req.payment_mode == "card" {
        let client = reqwest::Client::new();
        let params = [
            ("ui_mode", "embedded_page".to_string()),
            ("mode", "payment".to_string()),
            ("return_url", "https://stillagestoragesolutions.co.uk/checkout/return?session_id={CHECKOUT_SESSION_ID}".to_string()),
            ("line_items[0][quantity]", quote.quantity.to_string()),
            ("line_items[0][price_data][currency]", "gbp".to_string()),
            ("line_items[0][price_data][unit_amount]", quote.discounted_unit_ex_vat_pence.to_string()),
            ("line_items[0][price_data][product_data][name]", format!("{} ({})", req.product_title, quote.sku)),
            ("line_items[1][quantity]", "1".to_string()),
            ("line_items[1][price_data][currency]", "gbp".to_string()),
            ("line_items[1][price_data][unit_amount]", quote.delivery_ex_vat_pence.to_string()),
            ("line_items[1][price_data][product_data][name]", format!("UK HGV Pallet Freight ({})", quote.delivery_zone)),
            ("line_items[2][quantity]", "1".to_string()),
            ("line_items[2][price_data][currency]", "gbp".to_string()),
            ("line_items[2][price_data][unit_amount]", quote.vat_amount_pence.to_string()),
            ("line_items[2][price_data][product_data][name]", "UK Standard Rate VAT (20%)".to_string()),
            ("metadata[orderReference]", order_ref.clone()),
        ];

        if let Ok(res) = client
            .post("https://api.stripe.com/v1/checkout/sessions")
            .bearer_auth(&stripe_secret)
            .form(&params)
            .send()
            .await
        {
            if let Ok(json) = res.json::<serde_json::Value>().await {
                session_id = json.get("id").and_then(|v| v.as_str()).map(|s| s.to_string());
                client_secret = json.get("client_secret").and_then(|v| v.as_str()).map(|s| s.to_string());
            }
        }
    }

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
            "Stripe Embedded Checkout session prepared for order {} ({}x {}).",
            order_ref, quote.quantity, req.product_title
        )
    };

    let resp = CheckoutResponse {
        status: if client_secret.is_some() { "embedded_ready".to_string() } else { "ready".to_string() },
        order_reference: order_ref.clone(),
        payment_mode: req.payment_mode,
        session_id,
        client_secret,
        hosted_invoice_url,
        invoice_pdf_url,
        checkout_url: Some(format!("/checkout?order_ref={}", order_ref)),
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
