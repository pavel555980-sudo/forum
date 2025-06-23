from sqladmin import ModelView

from forum_auth.domain.models import UserSession


class UserSessionView(ModelView, model=UserSession):
    column_list = [
        UserSession.session_id,
        UserSession.user,
        UserSession.session_token,
        UserSession.created_at,
    ]
