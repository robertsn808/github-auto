from flask import Blueprint, request, jsonify
from src.models.repository import db, Repository, Analysis, AutomationEntry
from datetime import datetime
import json

repository_bp = Blueprint('repository', __name__)

@repository_bp.route('/repositories', methods=['GET'])
def get_repositories():
    """Get all repositories with their latest analysis"""
    try:
        repositories = Repository.query.all()
        result = []

        for repo in repositories:
            repo_dict = repo.to_dict()
            # Get latest analysis
            latest_analysis = Analysis.query.filter_by(repository_id=repo.id).order_by(Analysis.created_at.desc()).first()
            if latest_analysis:
                repo_dict['latest_analysis'] = latest_analysis.to_dict()
            result.append(repo_dict)

        return jsonify({
            'success': True,
            'repositories': result
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories', methods=['POST'])
def create_repository():
    """Create a new repository record"""
    try:
        data = request.get_json()

        # Check if repository already exists
        existing_repo = Repository.query.filter_by(full_name=data.get('full_name')).first()
        if existing_repo:
            return jsonify({
                'success': False,
                'error': 'Repository already exists',
                'repository': existing_repo.to_dict()
            }), 409

        # Create new repository
        repo = Repository(
            name=data.get('name'),
            full_name=data.get('full_name'),
            url=data.get('url'),
            description=data.get('description'),
            language=data.get('language'),
            stars=data.get('stars', 0),
            forks=data.get('forks', 0),
            open_issues=data.get('open_issues', 0),
            has_readme=data.get('has_readme', False),
            has_license=data.get('has_license', False),
            has_issues=data.get('has_issues', False),
            contributor_count=data.get('contributor_count', 0),
            pr_count=data.get('pr_count', 0),
            total_files=data.get('total_files', 0),
            has_tests=data.get('has_tests', False),
            has_documentation=data.get('has_documentation', False),
            has_ci=data.get('has_ci', False),
            config_files_count=data.get('config_files_count', 0)
        )

        db.session.add(repo)
        db.session.commit()

        return jsonify({
            'success': True,
            'repository': repo.to_dict()
        }), 201
    except Exception as e:
        import traceback
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/<int:repo_id>', methods=['GET'])
def get_repository(repo_id):
    """Get a specific repository with all its analyses"""
    try:
        repo = Repository.query.get_or_404(repo_id)
        repo_dict = repo.to_dict()

        # Get all analyses for this repository
        analyses = Analysis.query.filter_by(repository_id=repo_id).order_by(Analysis.created_at.desc()).all()
        repo_dict['analyses'] = [analysis.to_dict() for analysis in analyses]

        # Get automation entries
        automation_entries = AutomationEntry.query.filter_by(repository_id=repo_id).order_by(AutomationEntry.created_at.desc()).all()
        repo_dict['automation_entries'] = [entry.to_dict() for entry in automation_entries]

        return jsonify({
            'success': True,
            'repository': repo_dict
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/<int:repo_id>/analyses', methods=['GET'])
def get_analyses(repo_id):
    """Get all analyses for a repository"""
    try:
        # Verify repository exists
        repo = Repository.query.get_or_404(repo_id)

        analyses = Analysis.query.filter_by(repository_id=repo_id).order_by(Analysis.created_at.desc()).all()

        return jsonify({
            'success': True,
            'analyses': [analysis.to_dict() for analysis in analyses]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/<int:repo_id>/analyses/<int:analysis_id>', methods=['GET'])
def get_analysis(repo_id, analysis_id):
    """Get a specific analysis"""
    try:
        analysis = Analysis.query.filter_by(id=analysis_id, repository_id=repo_id).first_or_404()

        return jsonify({
            'success': True,
            'analysis': analysis.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/<int:repo_id>/automation-entries', methods=['POST'])
def create_automation_entry():
    """Create a new automation entry"""
    try:
        data = request.get_json()
        repo_id = request.view_args['repo_id']

        # Verify repository exists
        repo = Repository.query.get_or_404(repo_id)

        entry = AutomationEntry(
            repository_id=repo_id,
            analysis_id=data.get('analysis_id'),
            action=data.get('action'),
            status=data.get('status', 'pending'),
            details=data.get('details'),
            branch_name=data.get('branch_name'),
            pr_title=data.get('pr_title'),
            pr_url=data.get('pr_url')
        )

        entry.set_metadata(data.get('metadata', {}))

        db.session.add(entry)
        db.session.commit()

        return jsonify({
            'success': True,
            'automation_entry': entry.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/<int:repo_id>/automation-entries', methods=['GET'])
def get_automation_entries(repo_id):
    """Get all automation entries for a repository"""
    try:
        # Verify repository exists
        repo = Repository.query.get_or_404(repo_id)

        entries = AutomationEntry.query.filter_by(repository_id=repo_id).order_by(AutomationEntry.created_at.desc()).all()

        return jsonify({
            'success': True,
            'automation_entries': [entry.to_dict() for entry in entries]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/search', methods=['GET'])
def search_repositories():
    """Search repositories by name or full_name"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter "q" is required'
            }), 400

        repositories = Repository.query.filter(
            db.or_(
                Repository.name.ilike(f'%{query}%'),
                Repository.full_name.ilike(f'%{query}%'),
                Repository.description.ilike(f'%{query}%')
            )
        ).all()

        result = []
        for repo in repositories:
            repo_dict = repo.to_dict()
            # Get latest analysis
            latest_analysis = Analysis.query.filter_by(repository_id=repo.id).order_by(Analysis.created_at.desc()).first()
            if latest_analysis:
                repo_dict['latest_analysis'] = latest_analysis.to_dict()
            result.append(repo_dict)

        return jsonify({
            'success': True,
            'repositories': result
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get overall statistics"""
    try:
        total_repos = Repository.query.count()
        total_analyses = Analysis.query.count()
        total_automation_entries = AutomationEntry.query.count()

        # Get recent activity
        recent_analyses = Analysis.query.order_by(Analysis.created_at.desc()).limit(5).all()
        recent_automation = AutomationEntry.query.order_by(AutomationEntry.created_at.desc()).limit(5).all()

        return jsonify({
            'success': True,
            'statistics': {
                'total_repositories': total_repos,
                'total_analyses': total_analyses,
                'total_automation_entries': total_automation_entries,
                'recent_analyses': [analysis.to_dict() for analysis in recent_analyses],
                'recent_automation': [entry.to_dict() for entry in recent_automation]
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@repository_bp.route('/repositories/lookup', methods=['GET'])
def lookup_repository():
    url = request.args.get('url')
    repo = Repository.query.filter_by(url=url).first()
    if repo:
        return jsonify({'success': True, 'repository': repo.to_dict()})
    return jsonify({'success': False, 'error': 'Repository not found'}), 404

#@repository_bp.route('/repositories', methods=["POST"])
#def create_repository():
#    data = request.get_json()
    # handle saving the repository
#    return jsonify({"message": "Repository saved successfully"})

