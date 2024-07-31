"use client";
import Link from "next/link";
import mensajes from "./Mensajes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function NavBar() {
  const { role, token, logoutUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser()
    mensajes("Gracias", "Hasta la proxima");
    router.push('/principal');
    router.refresh();
  }

  return (
    <nav className="navbar">
      <div>
        <ul>
          <li>
            <Link href={"/principal"}>
              Inicio
            </Link>
          </li>
          <li>
            <Link href={"/historial"}>
              Historial
            </Link>
          </li>
          {role === 'Administrador' &&
            <li>
              <Link href={"/placas"}>
                Placas
              </Link>
            </li>
          }
          {/* {token &&
            <li>
              <Link href={"/perfil"}>
                Perfil
              </Link>
            </li>
          } */}
          {role === 'Administrador' &&
            <li>
              <Link href={"/crear_usuario"}>
                Nuevo usuario
              </Link>
            </li>
          }
          {role === 'Administrador' &&
            <li>
              <Link href={"/exportar"}>
                Exportar
              </Link>
            </li>
          }
          {role === 'Administrador' &&
            <li>
              <Link href={"/cuentas"}>
                Gestionar Cuentas
              </Link>
            </li>
          }
        </ul>
      </div>
      {token ? (
        <button type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      ) : (
        <Link href="/login">
          <button type="button">
            Iniciar sesión
          </button>
        </Link>
      )}
    </nav>
  );
}