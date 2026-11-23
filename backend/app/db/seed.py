from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def run_seed() -> None:
    create_all_tables()

    with session_factory() as session:
        # 1. Usuario administrador
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Food9899@"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.commit()
            print("Usuario admin creado (admin / Food9899@)")
        else:
            print("Usuario admin ya existía.")

        # 2. Categorías (al menos 3)
        categorias_data = [
            ("Pizzas", "Pizzas artesanales horneadas a la piedra con masa madre"),
            ("Hamburguesas", "Hamburguesas caseras en pan brioche con papas fritas"),
            ("Empanadas", "Empanadas criollas hechas a mano, al horno o fritas"),
            ("Bebidas", "Bebidas frías y aguas saborizadas para acompañar"),
        ]

        categorias_map: dict[str, int] = {}
        for nombre, descripcion in categorias_data:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion, activo=True)
                session.add(cat)
                session.commit()
                session.refresh(cat)
                print(f"Categoría creada: {nombre}")
            assert cat.id is not None
            categorias_map[nombre] = cat.id

        # 3. Productos (al menos 8 con stock)
        productos_data = [
            (
                "Pizza Muzzarella",
                "Salsa de tomates naturales, abundante muzzarella, aceitunas y orégano",
                11500.0,
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
                25,
                "Pizzas",
            ),
            (
                "Pizza Napolitana",
                "Muzzarella, rodajas de tomate fresco, ajo picado y albahaca",
                12900.0,
                "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80",
                20,
                "Pizzas",
            ),
            (
                "Hamburguesa Doble Cheddar",
                "Doble medallón de 160g, queso cheddar fundido y panceta crocante",
                10800.0,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
                30,
                "Hamburguesas",
            ),
            (
                "Hamburguesa Crispy Chicken",
                "Pechuga de pollo rebozada crocante, lechuga, tomate y alioli suave",
                9900.0,
                "https://images.unsplash.com/photo-1615297928064-24977384d0da?w=600&q=80",
                18,
                "Hamburguesas",
            ),
            (
                "Empanadas de Carne Cortada a Cuchillo (x6)",
                "Media docena de empanadas salteñas jugosas con cebolla de verdeo y huevo",
                8400.0,
                "https://resizer.glanacion.com/resizer/v2/empanadas-de-carne-cortada-a-cuchillo-con-mix-YTRLESEOGZFU5LU3G4AOBZ2EP4.jpeg?auth=1bc85880de7b6e0e41370aa13090c3d1e8e04fbc6b564b783626d40a493f821f&width=880&height=586&quality=70&smart=true",
                40,
                "Empanadas",
            ),
            (
                "Empanadas de Jamón y Queso (x6)",
                "Media docena de empanadas rellenas de jamón cocido natural y muzzarella",
                7900.0,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1e6uUGKp-qc02CPEWTE7v-K7r_B8zZhWy83s82rgpjQ&s=10",
                35,
                "Empanadas",
            ),
            (
                "Agua Mineral sin Gas 500ml",
                "Botella de agua mineral bien fría",
                2200.0,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaEsnaTOBDKV84q9JFCBj9pDVQbu7WCJqBnigh3H0GHw&s",
                60,
                "Bebidas",
            ),
            (
                "Gaseosa Cola Zero 500ml",
                "Gaseosa cola sin azúcar en botella de 500ml",
                2800.0,
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgv8ST2D_rWMg-8AZAMyJbKheD4FPMCt3IYnuMF6BunA&s=10",
                50,
                "Bebidas",
            ),
        ]

        for nombre, desc, precio, img, stock, cat_nombre in productos_data:
            prod = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if prod is None:
                prod = Producto(
                    nombre=nombre,
                    descripcion=desc,
                    precio_base=precio,
                    imagen_url=img,
                    stock=stock,
                    disponible=True,
                    activo=True,
                    categoria_id=categorias_map[cat_nombre],
                )
                session.add(prod)
                session.commit()
                print(f"Producto creado: {nombre}")

    print("Seed completado correctamente.")


if __name__ == "__main__":
    run_seed()