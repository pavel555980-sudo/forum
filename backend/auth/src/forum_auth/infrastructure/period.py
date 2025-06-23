from functools import cached_property

from datetime import datetime

from .dto import BaseDTO


class Period(BaseDTO):
    starts_at: datetime
    ends_at: datetime

    @cached_property
    def delta(self):
        return self.ends_at - self.starts_at
