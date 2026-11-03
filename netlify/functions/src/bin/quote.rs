use aws_lambda_events::apigw::{ApiGatewayProxyRequest, ApiGatewayProxyResponse};
use aws_lambda_events::encodings::Body;
use aws_lambda_events::http::HeaderMap;
use lambda_runtime::{service_fn, Error, LambdaEvent};
use stillage_commerce::{calculate_quote, QuoteRequest};

async fn handler(event: LambdaEvent<ApiGatewayProxyRequest>) -> Result<ApiGatewayProxyResponse, Error> {
    let mut headers = HeaderMap::new();
    headers.insert("content-type", "application/json".parse().unwrap());

    let body_str = event.payload.body.unwrap_or_default();
    let parsed: Result<QuoteRequest, _> = serde_json::from_str(&body_str);

    match parsed {
        Ok(req) => {
            let quote = calculate_quote(&req);
            Ok(ApiGatewayProxyResponse {
                status_code: 200,
                headers,
                multi_value_headers: HeaderMap::new(),
                body: Some(Body::Text(serde_json::to_string(&quote)?)),
                is_base64_encoded: false,
            })
        }
        Err(err) => Ok(ApiGatewayProxyResponse {
            status_code: 400,
            headers,
            multi_value_headers: HeaderMap::new(),
            body: Some(Body::Text(
                serde_json::json!({ "error": format!("Invalid quote request payload: {}", err) }).to_string(),
            )),
            is_base64_encoded: false,
        }),
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    lambda_runtime::run(service_fn(handler)).await
}
