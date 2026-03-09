# KevinMahecha_PokeDex

[![Ver en Vivo](https://img.shields.io/badge/Demo-Vercel-red?style=for-the-badge&logo=vercel)](https://kevin-mahecha-pokedex.vercel.app)

Este proyecto es una Pokédex interactiva desarrollada con el objetivo de profundizar en el ecosistema de **Angular**. Se enfoca en la implementación de las últimas características del framework, la gestión de estados reactivos y el consumo eficiente de APIs REST.

## Propósito del Proyecto
A diferencia de una aplicación básica, este proyecto prioriza la experiencia de usuario (UX) y la eficiencia técnica, utilizando herramientas modernas para resolver problemas comunes como la latencia de red y la manipulación de flujos de datos complejos.

## Tecnologías y Conceptos Implementados

### Angular (v17/18+)
Uso de flujo de control moderno (`@if`, `@for`) y bloques de `@defer` para optimizar la carga de componentes pesados.

### Signals
Gestión de estado reactivo para filtros, modales y el control fino de los estados de carga.

### RxJS
Coordinación de múltiples peticiones asíncronas mediante `forkJoin` y manejo de errores con `catchError` para asegurar la estabilidad de la aplicación.

### Tailwind CSS
Diseño responsivo con técnicas de *glassmorphism* (`backdrop-blur`) y animaciones personalizadas en CSS.

## Características Destacadas

* **Optimización de Carga:** Sistema de *Skeleton Screens* que proporciona feedback visual inmediato mientras se obtienen los datos.
* **Timer de Cortesía:** Implementación de un retraso de 500ms para el spinner de carga global, evitando parpadeos visuales innecesarios en conexiones rápidas.
* **Búsqueda e Historial:** Sistema de búsqueda global que integra resultados locales y consultas directas a la API cuando el Pokémon no reside en la caché actual.
* **Paginación Eficiente:** Manejo de grandes volúmenes de datos mediante un sistema de paginado manual controlado por señales.

**¿Te gusta mi trabajo?** ¡Hablemos! Puedes encontrar mis datos de contacto en mi [Sitio Personal](https://kevinmahecha.vercel.app/)
