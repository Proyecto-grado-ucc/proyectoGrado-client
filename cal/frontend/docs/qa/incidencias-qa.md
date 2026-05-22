# Incidencias detectadas durante QA

## QA-BUG-001 - Pruebas unitarias backend fallan por dependencias faltantes en mocks

Tipo: prueba funcional automatizada  
Caso relacionado: CAL-QA-011  
Estado sugerido: To Do  
Severidad: Alta  
Responsable sugerido: Backend

### Descripcion

La ejecucion de `npm test -- --runInBand` en el backend finaliza con 4 suites fallidas y 20 pruebas fallidas. El patron principal corresponde a servicios que ahora requieren dependencias adicionales, pero los archivos `.spec.ts` no las estan inyectando en el modulo de pruebas.

### Resultado esperado

Todas las suites backend deben compilar y ejecutarse correctamente.

### Resultado obtenido

```text
Test Suites: 4 failed, 24 passed, 28 total
Tests:       20 failed, 122 passed, 142 total
```

### Evidencia tecnica

Errores principales:

- `AuthServicio`: falta mock/provider de `CorreoServicio`.
- `EstudiantesServicio`: falta mock/provider de `GrupoRepository`.
- `FormulariosServicio`: falta mock/provider de `DimensionRepository`.


## QA-BUG-002 - Rendimiento inicial bajo en Lighthouse

Tipo: rendimiento  
Caso relacionado: CAL-QA-008  
Estado sugerido: To Do  
Severidad: Media  
Responsable sugerido: Frontend

### Descripcion

La categoria Performance de Lighthouse obtuvo 48/100 sobre el despliegue publico.

### Resultado esperado

Puntaje minimo sugerido: 70/100.

### Resultado obtenido

```json
{
  "performance": 48
}
```


## QA-BUG-003 - Accesibilidad automatizada por debajo del umbral

Tipo: accesibilidad  
Caso relacionado: CAL-QA-007  
Estado sugerido: To Do  
Severidad: Media  
Responsable sugerido: Frontend

### Descripcion

La categoria Accessibility de Lighthouse obtuvo 80/100. El umbral recomendado es >= 90.

### Resultado esperado

Puntaje minimo sugerido: 90/100.

### Resultado obtenido

```json
{
  "accessibility": 80
}
```

