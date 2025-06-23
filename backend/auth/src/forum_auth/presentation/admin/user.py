from sqladmin import ModelView

from forum_auth.domain.models import User


class UserView(ModelView, model=User):
    column_list = [
        User.id,
        User.nick,
        User.email,
        User.sessions,
    ]
