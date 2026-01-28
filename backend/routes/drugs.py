from flask import Blueprint, jsonify
from models.database import drugs_collection

drugs_bp = Blueprint("drugs", __name__)


@drugs_bp.route("/drugs", methods=["GET"])
def get_all_drugs():
    """Get all drugs"""
    try:
        drugs = list(drugs_collection.find({}, {"_id": 0}))
        return jsonify({"success": True, "drugs": drugs, "count": len(drugs)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@drugs_bp.route("/drug/<drug_name>", methods=["GET"])
def get_drug_info(drug_name):
    """Get specific drug info"""
    try:
        drug = drugs_collection.find_one(
            {"name": {"$regex": drug_name, "$options": "i"}}, {"_id": 0}
        )

        if drug:
            return jsonify({"success": True, "drug": drug}), 200
        else:
            return jsonify(
                {"success": False, "message": f"Drug '{drug_name}' not found"}
            ), 404

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@drugs_bp.route("/banned-drugs", methods=["GET"])
def get_banned_drugs():
    """Get banned/recalled drugs"""
    try:
        banned_drugs = list(
            drugs_collection.find(
                {
                    "government_status.status": {
                        "$in": ["BANNED", "RECALLED", "BANNED/RECALLED"]
                    }
                },
                {"_id": 0},
            )
        )

        return jsonify(
            {"success": True, "banned_drugs": banned_drugs, "count": len(banned_drugs)}
        ), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
