# TP programmation réactive, Web sockets, et applications offlines

Le TP a pour objectif de réaliser une application temps réel de gestion de TODO.
(Tâche à faire)
Depuis un navigateur, n’importe qui peut modifier la liste des todos, 
cette dernières est instantanément mise à jour sur le grand écran partagé
et sur tous les navigateurs ouverts sur la page.

### Unité d'Enseignement
- M1IF13 - Programmation Web avancée et mobile	
- Prof. Lionel Medini & Prof. Aurlien Tabard
- [Page du cours](http://liris.cnrs.fr/lionel.medini/enseignement/M1IF13/)	

### Auteurs

- Amaia NAZABAL 11614291
- **Email**: amaia.nazabal-ruiz-diaz@etu.univ-lyon1.fr
- Sofiaa FADDI 11614340
- **Email**: sofiaa.faddi@etu.univ-lyon1.fr

### Archive
#####React
- Apps : contient les composants et websocketclient
- Dist : contient les fichiers générés par webpack : index.html & bundle.js
- Images : contient les images
- Less : contient le fichier less
- server : contient les fichiers du serveur
- .Babelrc
- webpack : pour configuration de webpack
- index.html : fichier index.html
- Gruntfile.js pour automatiser les taches
- styles : contient le fichier css qui va etre généré par Less

#####Cordova :
- index.html
- js : contient index.js et bundle.js  le fichiers doivent être en ecma2015
- css : contient le css de l'application 
- images : contient les images 
   
### Mise en oeuvre
React 
- [x] Créer une application statique
- [x] Créer une application dynamique
- [x] Lier à Backbone
- [x] Flow de React
- [x] Utilisation de webpack 
- [x] Enrichir l'application
- [x] Bonus: intégrer le routage Backbone

Websocket : 
- [x] Serveur et client websocket
- [x] Échange entre client et serveur
- [x] Échanges entre tous les clients (broadcast)

Cordova
- [x] Utiliser la géo-localisation
- [x] Ajout de la vibration
- [x] Utiliser les alertes natives
- [x] Scroll natif

### Description
####React
Nous vous utilisé plusieurs composants :
- HeaderMenu : pour le menu responsive et scroll native en utilisant react-bootstrap et ses composants.
     ce menu permet d'afficher le filtre par personne et par état de todo
- TodoBanner : est un composant pour afficher le numéro de la tâche
- Footer & Footer_Filtered permet de gérer les deux filtres . Un utilisateur peut visualiser les tâches par personnes , 
    par état ou par personne et état en même temps
- TodoInput : contient le formulaire pour ajouter une tâche : en saisant le nom de la tâche , la personne associée et 
     une adresse valide
- TodoList : permet de recupérer toutes les tâches déja saisies et vérfier si une tâche est completed ( finie ) ou active( en cours )
      un utilsateur peut changer l'etat d'une tâche de 'active ' à 'completed'
- TodoListItem : permet d'avoir une seule tâche ce composant est utilisé avec TodoList
- Rappel : un composant utilisant bootstrap pour le checkbox qui permet de confirmer le rappel utilisé dans
    la partie de cordova.
    
Nous avons aussi utilisé:
- Backbone router pour créer les routes , 
- Backbone Collection pour gérér les données  , 
- websocket pour l'échange de todos entre les différents clients connectés
       coté serveur et client 

Quand l'utilisateur ouvre l'application, il peut visualiser les tâches par les filtres, mettre des tâches à completed , création de nouvelles tâches, suppression des tâches,  tous les utilisateurs ont un ecran partagé c'est a dire ils visualisent la  meme Todo.
    
####Cordova
- Fonction de gélocalisation pour recuperer la position qui va etre comparée avec les position des todo en utilisant l'adresse
   de la tâche . cette derniere est convertie en longitude et lattitude par geocoder : utilisation de googlemaps avec une clé 
- Vibration pour que le téléphone vibre si la personne est proche de la tache  si cette personne a demandé un rappel 
- Utiliser les alertes natives pour afficher le rappel 
- Scroll natif : un menu pour avoir un accès rapide aux éléments de l'application

En ce qui concerne l'application mobile avec cordova , nous avons dans un premier temps récuperer la position de 
l'emulateur et comparer avec les todoList ( en particulier endroit de réalisation) qui ont un rappel ensuite, si 
l'utilisateur est proche de la tache alors son téléphone va vibrer et une notification va apparaitre

#### Conditions Préalables
	
1. Grunt v1.0.1 ou supérieure	
2. Grunt-cli v1.2.0 ou supérieure
3. Less
4. Java 1.8 ou supérieur
5. Android SDK
6. Emulateur ANDROID : Nexus 5, Android 5.1 Lollipop x86 (Api 22). pour les testes 


### Comment executer?	

##### React

Modifier le fichier `socketClient.js` qui se trouve dans le dossier `app/` pour indiquer l'IP de l'émulateur (ligne 7). 
Dans le cas de vouloir tester l'application dans le navigateur c'est suffisant de mettre `localhost`.

```javascript
var wssUrl = "ws://<IP>:3002";
```

Executer les commandes suivantes:
```
> npm install
> webpack
> grunt build
```
Ces deux dernières commandes permettent de genèrer le fichier css (en compilant le fichier Less) et fichier index.html 
et bundle.js dans le dossier `dist/`.

##### Cordova 
Pour éxecuter l'application avec Cordova, il faut déplacer les fichiers dans les dossiers `www/` le fichier `index.html`
avec les routes changés et les fichiers `bundle.js` et `socketClient.js` dans le dossier `www/js`
```
> cd cordova_project/
> cordova run android
```

##### Configurations
Pour changer le port du webSocket, c'est suffisant de modifier le fichier `socketServer.js` dans la ligne 8, et le 
fichier `socketClient.js` dans la ligne 7.