export interface RegistroUser {
  email: string;
  nombreCompleto: string;
  dni: string;
  direccion: string;
  telefono: string;
  password: string;
}

export function createUniqueUser(): RegistroUser {
  const unique = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

  return {
    email: `qa-${unique}@example.com`,
    nombreCompleto: 'Usuario QA Test',
    dni: unique.slice(-12),
    direccion: 'Calle Falsa 123',
    telefono: '1100000000',
    password: 'password123',
  };
}
