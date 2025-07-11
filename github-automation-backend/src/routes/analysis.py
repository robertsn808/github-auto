from flask import Blueprint, request, jsonify
from src.models.repository import Repository, db
from src.models.analysis import AnalysisResult
from src.models.analysis_result import AnalysisResult

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/repositories/<int:repo_id>/analyses', methods=['POST'])
def create_analysis(repo_id):
    try:
        repo = Repository.query.get(repo_id)
        if not repo:
            return jsonify({'success': False, 'error': 'Repository not found'}), 404

        # Simulated analysis data
        new_analysis = AnalysisResult(
            repository_id=repo_id,
            lint_issues=5,
            pull_requests=3,
            ci_passed=True
        )
        db.session.add(new_analysis)
        db.session.commit()

        return jsonify({'success': True, 'result': new_analysis.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@analysis_bp.route('/api/repositories/<int:repo_id>/analyses', methods=['GET'])
def list_analyses(repo_id):
    try:
        repo = Repository.query.get(repo_id)
        if not repo:
            return jsonify({'success': False, 'error': 'Repository not found'}), 404

        analyses = [a.to_dict() for a in repo.analyses]
        return jsonify({'success': True, 'analyses': analyses}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@analysis_bp.route('/api/repositories/<int:repo_id>/analyses', methods=['GET'])
def get_analyses(repo_id):
    results = AnalysisResult.query.filter_by(repository_id=repo_id).all()
    return jsonify({'success': True, 'analyses': [a.to_dict() for a in results]})

