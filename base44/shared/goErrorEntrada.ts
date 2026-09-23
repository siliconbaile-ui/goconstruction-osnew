// Errores del contrato administrativo, distintos de fallas internas o del agente.
export class ErrorEntradaRegistroGo extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorEntradaRegistroGo';
  }
}