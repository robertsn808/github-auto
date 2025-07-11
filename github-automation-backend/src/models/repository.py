from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Repository(db.Model):
    __tablename__ = 'repositories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False, unique=True)
    url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    language = db.Column(db.String(100))
    stars = db.Column(db.Integer, default=0)
    forks = db.Column(db.Integer, default=0)
    open_issues = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Repository health metrics
    has_readme = db.Column(db.Boolean, default=False)
    has_license = db.Column(db.Boolean, default=False)
    has_issues = db.Column(db.Boolean, default=False)
    contributor_count = db.Column(db.Integer, default=0)
    pr_count = db.Column(db.Integer, default=0)

    # Repository structure info
    total_files = db.Column(db.Integer, default=0)
    has_tests = db.Column(db.Boolean, default=False)
    has_documentation = db.Column(db.Boolean, default=False)
    has_ci = db.Column(db.Boolean, default=False)
    config_files_count = db.Column(db.Integer, default=0)

    # Relationships
    analyses = db.relationship('Analysis', backref='repository', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'full_name': self.full_name,
            'url': self.url,
            'description': self.description,
            'language': self.language,
            'stars': self.stars,
            'forks': self.forks,
            'open_issues': self.open_issues,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'health': {
                'has_readme': self.has_readme,
                'has_license': self.has_license,
                'has_issues': self.has_issues,
                'contributor_count': self.contributor_count,
                'pr_count': self.pr_count
            },
            'structure': {
                'total_files': self.total_files,
                'has_tests': self.has_tests,
                'has_documentation': self.has_documentation,
                'has_ci': self.has_ci,
                'config_files_count': self.config_files_count
            }
        }

class Analysis(db.Model):
    __tablename__ = 'analyses'

    id = db.Column(db.Integer, primary_key=True)
    repository_id = db.Column(db.Integer, db.ForeignKey('repositories.id'), nullable=False)

    # Analysis metadata
    analysis_type = db.Column(db.String(100), default='comprehensive')
    status = db.Column(db.String(50), default='completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Overall metrics
    overall_health_score = db.Column(db.Integer)
    architecture_analysis = db.Column(db.Text)

    # Analysis results stored as JSON
    bugs_detected = db.Column(db.Text)  # JSON string
    improvements_suggested = db.Column(db.Text)  # JSON string
    feature_ideas = db.Column(db.Text)  # JSON string
    security_concerns = db.Column(db.Text)  # JSON string
    performance_issues = db.Column(db.Text)  # JSON string
    documentation_gaps = db.Column(db.Text)  # JSON string

    # Test coverage analysis
    test_coverage_analysis = db.Column(db.Text)  # JSON string

    # Code quality metrics
    maintainability_score = db.Column(db.Integer)
    readability_score = db.Column(db.Integer)
    complexity_score = db.Column(db.Integer)
    duplication_score = db.Column(db.Integer)

    # Recommendations
    recommendations = db.Column(db.Text)  # JSON string

    def set_bugs_detected(self, bugs_list):
        self.bugs_detected = json.dumps(bugs_list) if bugs_list else None

    def get_bugs_detected(self):
        return json.loads(self.bugs_detected) if self.bugs_detected else []

    def set_improvements_suggested(self, improvements_list):
        self.improvements_suggested = json.dumps(improvements_list) if improvements_list else None

    def get_improvements_suggested(self):
        return json.loads(self.improvements_suggested) if self.improvements_suggested else []

    def set_feature_ideas(self, features_list):
        self.feature_ideas = json.dumps(features_list) if features_list else None

    def get_feature_ideas(self):
        return json.loads(self.feature_ideas) if self.feature_ideas else []

    def set_security_concerns(self, security_list):
        self.security_concerns = json.dumps(security_list) if security_list else None

    def get_security_concerns(self):
        return json.loads(self.security_concerns) if self.security_concerns else []

    def set_performance_issues(self, performance_list):
        self.performance_issues = json.dumps(performance_list) if performance_list else None

    def get_performance_issues(self):
        return json.loads(self.performance_issues) if self.performance_issues else []

    def set_documentation_gaps(self, docs_list):
        self.documentation_gaps = json.dumps(docs_list) if docs_list else None

    def get_documentation_gaps(self):
        return json.loads(self.documentation_gaps) if self.documentation_gaps else []

    def set_test_coverage_analysis(self, coverage_dict):
        self.test_coverage_analysis = json.dumps(coverage_dict) if coverage_dict else None

    def get_test_coverage_analysis(self):
        return json.loads(self.test_coverage_analysis) if self.test_coverage_analysis else {}

    def set_recommendations(self, recommendations_dict):
        self.recommendations = json.dumps(recommendations_dict) if recommendations_dict else None

    def get_recommendations(self):
        return json.loads(self.recommendations) if self.recommendations else {}

    def to_dict(self):
        return {
            'id': self.id,
            'repository_id': self.repository_id,
            'analysis_type': self.analysis_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'overall_health_score': self.overall_health_score,
            'architecture_analysis': self.architecture_analysis,
            'bugs_detected': self.get_bugs_detected(),
            'improvements_suggested': self.get_improvements_suggested(),
            'feature_ideas': self.get_feature_ideas(),
            'security_concerns': self.get_security_concerns(),
            'performance_issues': self.get_performance_issues(),
            'documentation_gaps': self.get_documentation_gaps(),
            'test_coverage_analysis': self.get_test_coverage_analysis(),
            'code_quality_metrics': {
                'maintainability': self.maintainability_score,
                'readability': self.readability_score,
                'complexity': self.complexity_score,
                'duplication': self.duplication_score
            },
            'recommendations': self.get_recommendations()
        }

class AutomationEntry(db.Model):
    __tablename__ = 'automation_entries'

    id = db.Column(db.Integer, primary_key=True)
    repository_id = db.Column(db.Integer, db.ForeignKey('repositories.id'), nullable=False)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analyses.id'), nullable=True)

    # Entry details
    action = db.Column(db.String(100), nullable=False)  # 'bug_fix', 'improvement', 'feature', etc.
    status = db.Column(db.String(50), default='pending')  # 'pending', 'in_progress', 'completed', 'failed'
    details = db.Column(db.Text)

    # Git information
    branch_name = db.Column(db.String(255))
    pr_title = db.Column(db.String(500))
    pr_url = db.Column(db.String(500))

    # Metadata stored as JSON
    entry_metadata = db.Column(db.Text)  # JSON string for additional data

    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_metadata(self, metadata_dict):
        self.entry_metadata = json.dumps(metadata_dict) if metadata_dict else None

    def get_metadata(self):
        return json.loads(self.entry_metadata) if self.entry_metadata else {}

    def to_dict(self):
        return {
            'id': self.id,
            'repository_id': self.repository_id,
            'analysis_id': self.analysis_id,
            'action': self.action,
            'status': self.status,
            'details': self.details,
            'branch_name': self.branch_name,
            'pr_title': self.pr_title,
            'pr_url': self.pr_url,
            'metadata': self.get_metadata(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

