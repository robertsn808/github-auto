from datetime import datetime
from .repository import db

class AnalysisResult(db.Model):
    __tablename__ = 'analysis_results'
    __table_args__ = {'extend_existing': True}


    id = db.Column(db.Integer, primary_key=True)
    repository_id = db.Column(db.Integer, db.ForeignKey('repositories.id'), nullable=False)
    lint_issues = db.Column(db.Integer, default=0)
    pull_requests = db.Column(db.Integer, default=0)
    ci_passed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'repository_id': self.repository_id,
            'lint_issues': self.lint_issues,
            'pull_requests': self.pull_requests,
            'ci_passed': self.ci_passed,
            'created_at': self.created_at.isoformat()
        }

