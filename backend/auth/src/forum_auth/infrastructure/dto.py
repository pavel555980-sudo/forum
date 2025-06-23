from base64 import urlsafe_b64encode, urlsafe_b64decode
from typing import Type

from pydantic import BaseModel, ConfigDict, RootModel, model_validator


class PydanticDTOMixin:
    model_config = ConfigDict(frozen=True, from_attributes=True)

    def model_dump_base64url(self: BaseModel, by_alias: bool = True):
        json = self.model_dump_json(by_alias=by_alias, exclude_none=True)
        blob = json.encode('ascii')
        return urlsafe_b64encode(blob)

    @classmethod
    def model_validate_base64url(cls: Type[BaseModel], string: str):
        return cls.model_validate_json(urlsafe_b64decode(string).decode('ascii'))


class BaseDTO(BaseModel, PydanticDTOMixin):
    pass


class BaseRootDTO(RootModel, PydanticDTOMixin):
    pass


class BaseRootSortedDTO(BaseRootDTO):
    @model_validator(mode="after")
    def validator(self):
        self.root.sort()
        self.root.reverse()
        return self
    pass
