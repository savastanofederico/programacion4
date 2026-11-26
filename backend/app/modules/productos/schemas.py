from sqlmodel import SQLModel, Field
from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: str = Field(default="", max_length=500)
    precio_base: float = Field(ge=0)
    imagen_url: str = Field(default="", max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(ge=1)


class ProductoUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    descripcion: str | None = Field(default=None, max_length=500)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, ge=1)


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead | None = None


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
