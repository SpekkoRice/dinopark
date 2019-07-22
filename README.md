# Dinopark App


## dependencies
- node `v10.15.1`
- angular `8.0.6`

## how to run the project

install angular globally
```
npm install -g @angular/cli
```
to run the dev environment:
```
ng serve
```
to build the environment (your compiled html, css and js will be found under `./dist/dinopark-app/` of this project):
```
npm run build
```
## for review:
The primary logic of the application can be found under:
 - Template: `./src/app/app.component.html`
 - CSS: `./src/app/app.component.scss`
 - Controller: `./src/app/app.component.ts`
 - Feed Service (network requests): `./src/dino-status.service.ts`
 