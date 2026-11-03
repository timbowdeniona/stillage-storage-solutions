use serde::{Deserialize, Serialize};

pub const UK_VAT_RATE: f64 = 0.20;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteRequest {
    pub sku: String,
    pub base_price_ex_vat_pence: i64,
    pub quantity: u32,
    pub finish_option: String,
    pub mobility_option: String,
    pub postcode: Option<String>,
    pub requires_tail_lift: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteResponse {
    pub sku: String,
    pub quantity: u32,
    pub base_unit_pence: i64,
    pub finish_modifier_pence: i64,
    pub mobility_modifier_pence: i64,
    pub configured_unit_ex_vat_pence: i64,
    pub discount_percentage: u8,
    pub discounted_unit_ex_vat_pence: i64,
    pub line_subtotal_ex_vat_pence: i64,
    pub bulk_savings_ex_vat_pence: i64,
    pub pallet_count: u32,
    pub delivery_zone: String,
    pub delivery_ex_vat_pence: i64,
    pub tail_lift_surcharge_pence: i64,
    pub total_ex_vat_pence: i64,
    pub vat_amount_pence: i64,
    pub total_inc_vat_pence: i64,
    pub engine: String,
}

pub fn finish_modifier_pence(finish_option: &str) -> i64 {
    match finish_option {
        "raw-steel" => -1000,       // -£10.00 Raw unpainted steel
        "galvanised" => 4500,       // +£45.00 Hot-dip galvanised
        "custom-ral" => 2500,       // +£25.00 Custom corporate RAL colour
        _ => 0,                     // £0.00 Standard RAL 5010 Stillage Blue
    }
}

pub fn mobility_modifier_pence(mobility_option: &str) -> i64 {
    match mobility_option {
        "heavy-duty-castors" => 5500, // +£55.00 4x Swivel & Braked Polyurethane Castors
        "forklift-pockets" => 3000,   // +£30.00 Enclosed 4-Way Forklift Guide Pockets
        "both-castors-pockets" => 8000, // +£80.00 Combined Castors + Forklift Pockets
        _ => 0,                       // £0.00 Standard Pressed Steel Stacking Feet
    }
}

pub fn bulk_discount_percentage(quantity: u32) -> u8 {
    if quantity >= 10 {
        10
    } else if quantity >= 5 {
        5
    } else {
        0
    }
}

pub fn calculate_pallet_delivery(postcode: Option<&str>, quantity: u32, requires_tail_lift: bool) -> (u32, String, i64, i64) {
    // Up to 4 stillages stack per oversized HGV pallet space
    let pallet_count = ((quantity.max(1) - 1) / 4) + 1;
    let normalized = postcode.unwrap_or("").trim().to_uppercase();

    let (zone_name, rate_per_pallet_pence) = if normalized.starts_with("AB")
        || normalized.starts_with("IV")
        || normalized.starts_with("KW")
        || normalized.starts_with("PH")
        || normalized.starts_with("PA")
    {
        ("Scottish Highlands & Grampian (Zone C)".to_string(), 11500)
    } else if normalized.starts_with("BT") || normalized.starts_with("IM") || normalized.starts_with("PO3") {
        ("Offshore / NI / Islands (Zone D)".to_string(), 14500)
    } else if normalized.starts_with("LL")
        || normalized.starts_with("CH")
        || normalized.starts_with("SY")
        || normalized.starts_with("CW")
        || normalized.starts_with("WA")
        || normalized.starts_with("M")
        || normalized.starts_with("L")
    {
        ("North West & Wales Hub (Zone A)".to_string(), 6500)
    } else {
        ("UK Mainland Standard Pallet Network (Zone B)".to_string(), 7900)
    };

    let tail_lift_pence = if requires_tail_lift { 1500 } else { 0 };
    let delivery_ex_vat = (pallet_count as i64 * rate_per_pallet_pence) + tail_lift_pence;

    (pallet_count, zone_name, delivery_ex_vat, tail_lift_pence)
}

pub fn calculate_quote(req: &QuoteRequest) -> QuoteResponse {
    let qty = req.quantity.max(1);
    let finish_mod = finish_modifier_pence(&req.finish_option);
    let mobility_mod = mobility_modifier_pence(&req.mobility_option);
    let configured_unit = (req.base_price_ex_vat_pence + finish_mod + mobility_mod).max(1000);

    let discount_pct = bulk_discount_percentage(qty);
    let discounted_unit = ((configured_unit as f64) * (1.0 - (discount_pct as f64 / 100.0))).round() as i64;

    let raw_subtotal = configured_unit * (qty as i64);
    let line_subtotal = discounted_unit * (qty as i64);
    let bulk_savings = raw_subtotal - line_subtotal;

    let (pallet_count, delivery_zone, delivery_ex_vat_pence, tail_lift_surcharge_pence) =
        calculate_pallet_delivery(req.postcode.as_deref(), qty, req.requires_tail_lift);

    let total_ex_vat = line_subtotal + delivery_ex_vat_pence;
    let vat_amount = ((total_ex_vat as f64) * UK_VAT_RATE).round() as i64;
    let total_inc_vat = total_ex_vat + vat_amount;

    QuoteResponse {
        sku: req.sku.clone(),
        quantity: qty,
        base_unit_pence: req.base_price_ex_vat_pence,
        finish_modifier_pence: finish_mod,
        mobility_modifier_pence: mobility_mod,
        configured_unit_ex_vat_pence: configured_unit,
        discount_percentage: discount_pct,
        discounted_unit_ex_vat_pence: discounted_unit,
        line_subtotal_ex_vat_pence: line_subtotal,
        bulk_savings_ex_vat_pence: bulk_savings,
        pallet_count,
        delivery_zone,
        delivery_ex_vat_pence,
        tail_lift_surcharge_pence,
        total_ex_vat_pence: total_ex_vat,
        vat_amount_pence: vat_amount,
        total_inc_vat_pence: total_inc_vat,
        engine: "rust-serverless-v1".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bulk_tier_and_tail_lift_calculation() {
        let req = QuoteRequest {
            sku: "SSS-CANT-3B8A".to_string(),
            base_price_ex_vat_pence: 38500,
            quantity: 5,
            finish_option: "standard-blue".to_string(),
            mobility_option: "heavy-duty-castors".to_string(),
            postcode: Some("B1 1AA".to_string()),
            requires_tail_lift: true,
        };
        let res = calculate_quote(&req);
        assert_eq!(res.configured_unit_ex_vat_pence, 44000);
        assert_eq!(res.discount_percentage, 5);
        assert_eq!(res.discounted_unit_ex_vat_pence, 41800);
        assert_eq!(res.pallet_count, 2);
        assert_eq!(res.tail_lift_surcharge_pence, 1500);
    }
}
