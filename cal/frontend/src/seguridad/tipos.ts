export interface CredencialesLogin {
  email: string;
  contrasena: string;
}

export interface RespuestaAuth {
  access_token: string;
  refresh_token: string;
  rol: 'Admin' | 'Docente' | 'Estudiante';
}

export interface UsuarioAutenticado {
  email: string;
  rol: 'Admin' | 'Docente' | 'Estudiante';
}
