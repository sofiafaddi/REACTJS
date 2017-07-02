/**
 * Created by amaia.nazabal on 6/9/17.
 */

var React = require('react');
var ReactDOM = require('react-dom');
var Backbone = require('backbone');
var backboneMixin = require('backbone-react-component');
var underscore = require('underscore');
var classNames = require('classnames');
var ReactBootstrap = require('react-bootstrap');
var apps = apps || {};

apps.ALL_TODOS = 'all';
apps.ACTIVE_TODOS = 'active';
apps.COMPLETED_TODOS = 'completed';

EVENT.reload = underscore.extend({}, Backbone.Events);

/**
 * Les models pour les collections des taches et des utilisateurs
 */
const taskModel = Backbone.Model.extend({
    defaults: {
        id: '',
        task: '',
        user: '',
        completed: false,
        lon: '',
        lat: '',
        rappel: ''
    },
    idAttribute: 'id',
    url: '/test'
});

const userModel = Backbone.Model.extend({
    defaults: {
        name: ''
    },
    idAttribute: 'name',
    url: '/test'
});

const todoItems = new Backbone.Collection({
    model: taskModel,
    comparator: 'id',
    url: '/test'

});

const users = new Backbone.Collection({
    model: userModel,
    comparator: 'name',
    url: '/test'
});
users.set([]);

/**
 * La fonction qui vérifie si l'utilisateur a changé sa position et qui appele au serveur
 * pour verifier s'il a des tâches qui sont proches
 * @param position
 * @returns {Array}
 */
function onSuccess(position) {
    var info = [];
    info.push(position.coords.latitude);
    info.push(position.coords.longitude);

    SocketClient.checkCloseTask(position.coords.latitude, position.coords.longitude);

    return info;
}

function onError(error) {
    console.debug('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

/**
 * La variable qui surveille si l'utilisateur change sa position
 * @type {Number}
 */
var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {timeout: 10000, enableHighAccuracy: true});
var ACTUAL_POSITION = {};

/**
 * Cette méthode prendre l'input de l'utilisateur (l'adresse) et envoie le text au service de Google
 * pour détérminer les coodonnées
 *
 * @param addresse l'adresse que l'utilisateur a rentré
 * @param rappel s'il veut étre notifié s'il est proche ou pas d'une tâche
 * @param useActualPosition s'il veut qu'on utilise sa position actuel pour assigner à la tache
 * @param callback la fonction qui va envoyer les données au serveur.
 */
var getGeoCoordinates = function (addresse, rappel, useActualPosition, callback) {
    var add = {lat: '', long: ''};
    if (rappel && !useActualPosition) {
        var getGeocoder = new google.maps.Geocoder();

        getGeocoder.geocode({'address': addresse}, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[0]) {

                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();
                    add['lat'] = latitude;
                    add['long'] = longitude;

                    callback(add);
                }
                else {
                    navigator.notification.alert('Unable to detect your coordinates.');
                    add['lat'] = 0;
                    add['long'] = 0;

                    callback(add);
                }
            }
            else {
                add['lat'] = 0;
                add['long'] = 0;
                callback(add);
            }
        });
    } else if (rappel && useActualPosition) {
        add['lat'] = ACTUAL_POSITION.lat;
        add['long'] = ACTUAL_POSITION.long;
    }

    callback(add);

};

/**
 * Le Banner avec la quantité des tâches (actives et non actives).
 */
class TodoBanner extends React.Component {
    render() {
        return <div className="row">
            <div className="col-lg-12">
                <h4> Tâches : {this.props.qtyTodos}</h4>
            </div>
            <hr/>
        </div>;
    }
}

/**
 * Le check puisque l'utilisateur puisse indiquer qu'il veut assigner sa position actuelle à la tache
 */
class UseActualPosition extends React.Component {
    constructor() {
        super();
    }

    render() {
        const value = this.props.value;
        return (
            <ReactBootstrap.FormGroup>
                <ReactBootstrap.Checkbox name="checkPosition" inline onChange={this.props.onChange}
                                         checked={value}>
                    Voulez vous qu'on utilise votre position actuelle pour assigner à la tâche
                </ReactBootstrap.Checkbox>
            </ReactBootstrap.FormGroup>)
    }
}

/**
 * L'option pour indiquer s'i veut etre notifié s'il est proche d'une tâche.
 */
class Rappel extends React.Component {
    constructor() {
        super();
    }
    render() {
        const value = this.props.value;
        return (
            <ReactBootstrap.FormGroup>
                <ReactBootstrap.Checkbox name="radioGroup" inline onChange={this.props.onChange}
                                         checked={value}>
                    Voulez vous etre rappelé lorsque vous serez proche de la tache
                </ReactBootstrap.Checkbox>
                {' '}
            </ReactBootstrap.FormGroup>
        )
    }
}

/**
 * Le component pour le formulaire pour ajouter des nouvelles tâches.
 * L'utilisateur peut mettre un adresse ou bien selectionner la option de recupèrer sa position actuelle
 * et la fonction `handleUsePositionChange` va garder la latitude et longitude de la position actuelle.
 */
class TodoForm extends React.Component {
    constructor() {
        super();
        this.state = {item: '', personne: '', adresse: '', rappel: false, useActualPosition: false};

        this.disabledAddress = false;
        this.handleTaskChange = this.handleTaskChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.handleAdresseChange = this.handleAdresseChange.bind(this);
        this.handleRappelChange = this.handleRappelChange.bind(this);
        this.handleUsePositionChange = this.handleUsePositionChange.bind(this);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleTaskChange(event) {
        this.setState({item: event.target.value});
    }

    handleUserChange(event) {
        this.setState({personne: event.target.value});
    }

    handleAdresseChange(event) {
        this.setState({adresse: event.target.value});
    }

    handleRappelChange(event) {
        this.setState({rappel: event.target.checked});
    }

    handleUsePositionChange(event) {
        this.setState({useActualPosition: event.target.checked});

        if (event.target.value)
            this.setState({disabledAddress: true});
        else
            this.setState({disabledAddress: false});

        navigator.geolocation.getCurrentPosition(function (position) {
            ACTUAL_POSITION = {
                lat: position.coords.latitude,
                long: position.coords.longitude
            };
        }, function (error) {
            console.debug(error);
        }, {
            maximumAge: 3000, timeout: 60000, enableHighAccuracy: true
        });
    }

    handleSubmit(event) {
        if (this.state.item.length === 0 || this.state.personne.length === 0) {
            event.preventDefault();
            return false;
        } else {
            event.preventDefault();
            this.props.addItem(this.state.item, this.state.personne, this.state.adresse, this.state.rappel,
                this.state.useActualPosition);

            this.setState({item: '', personne: '', adresse: '', disabledAddress: false, rappel: false,
                useActualPosition: false});

            this.focusInput();
            return false;
        }
    }

    focusInput() {
        this.textInput.focus();
    }

    render() {
        return (
            <div className="jumbotron formulaire">
                <form onSubmit={this.handleSubmit}>
                    <div className="row">
                        <div className="col-lg-offset-2 col-lg-8 col-md-offset-3 col-md-6 col-xs-offset-0 col-xs-12">
                            <div className="form-group">
                                <label>Tache</label>
                                <div className="input-group">
                                <span className="input-group-addon" key="basic-addon1"><span
                                    className="glyphicon glyphicon-tasks" aria-hidden="true"/></span>
                                    <input type="text" className="form-control" aria-describedby="basic-addon1"
                                           placeholder="Entrer une nouvele tâche" autoFocus="autoFocus"
                                           onChange={this.handleTaskChange} value={this.state.item}
                                           ref={(input) => {
                                               this.textInput = input;
                                           }}/>
                                </div>
                                <label>User:</label>
                                <div className="input-group">
                                <span className="input-group-addon" key="basic-addon2"><span
                                    className="glyphicon glyphicon-user" aria-hidden="true"/></span>
                                    <input type="text" className="form-control" aria-describedby="basic-addon2"
                                           placeholder="Entrer un nom pour assigner cette tache"
                                           onChange={this.handleUserChange} value={this.state.personne}
                                    />

                                </div>

                                <label>Adresse:</label>
                                <div className="input-group">
                                <span className="input-group-addon" key="basic-addon3"><span
                                    className="glyphicon glyphicon-map-marker" aria-hidden="true"/></span>
                                    <input type="text" className="form-control" aria-describedby="basic-addon3"
                                           placeholder="Entrer un ad pour assigner cette tache"
                                           onChange={this.handleAdresseChange} value={this.state.adresse}
                                           disabled={this.state.disabledAddress}
                                    />
                                </div>
                            </div>
                        </div>
                        <UseActualPosition onChange={this.handleUsePositionChange} value={this.state.useActualPosition}/>
                        <Rappel onChange={this.handleRappelChange} value={this.state.rappel}/>
                        <br/>
                        <div className=" col-md-offset-4 col-md-4 col-xs-offset-2 col-xs-8">
                            <button type="submit" className="btn btn-primary btn-block btn_custom shape-1  effect-4">
                                <span className="glyphicon glyphicon-plus-sign" aria-hidden="true"/>Ajouter une tâche
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}


/**
 * Les options pour changer l'état et supprimer une tâche dans la liste.
 */
class TaskAction extends React.Component {

    updateItem() {
        this.props.updateItem(this.props.index);
    }

    removeItem() {
        this.props.removeItem(this.props.index);
    }

    getButton() {
        if (!this.props.completed) {
            return (
                <button type="button" onClick={() => this.updateItem()}
                        className="btn btn-xs btn-success">
                    <i className="glyphicon glyphicon-ok"></i>
                </button>
            )
        }
    }

    render() {
        return (
            <div className="btn-group btn-group-xs pull-right" role="group">
                {this.getButton()}
                <button type="button" onClick={() => this.removeItem()}
                        className="btn btn-xs btn-danger">
                    <i className="glyphicon glyphicon-remove"></i>
                </button>
            </div>
        )
    }
}

/**
 * Le component pour montrer un item dans la liste de tâches avec les actions possibles
 * (changer d'état et supprimer)
 */
class TodoListItem extends React.Component {
    render() {
        let cssClass = 'list-group-item list-group-item-';

        if (this.props.item.completed)
            cssClass += 'success';
        else
            cssClass += 'info';

        return (
            <li key={this.props.item.id}
                className={cssClass}>
                Tâche {this.props.item.id + " : " + this.props.item.task }<span><b> assignée à </b> {this.props.item.user}</span>
                <TaskAction
                    index={this.props.item.id}
                    completed={this.props.item.completed}
                    updateItem={this.props.updateItem}
                    removeItem={this.props.removeItem}/>
            </li>
        );
    }
}

/**
 * Le footer qui montre le filtre pour selectionner les tâches qui vont se montrer
 * selon les criteres de l'utilisateur: soit par état ou par le prenom de l'utilisateur assigné.
 */
class Footer_Filtered extends React.Component {
    render() {
        const listuser = [];
        for (let i = 0; i < this.props.users.length; i++) {
            listuser.push(<ReactBootstrap.MenuItem className="listes_users" key={i + this.props.users[i].name}
                                                   eventKey={i}
                                                   href={"#/" + this.props.special + "user/" + this.props.users[i].name}>{this.props.users[i].name}</ReactBootstrap.MenuItem>);
        }
        return <div> {listuser}</div>
    }
}

/**
 * Le component pour creer le filtre (explique dans le composant précedent)
 */
class Footer extends React.Component {
    render() {
        return (
            <div className="filter"><ReactBootstrap.ButtonToolbar
                className={classNames({selected: this.props.nowShowing === apps.ALL_TODOS})} key="list1">
                <ReactBootstrap.DropdownButton bsSize="large" title=" All" key="list_user" id="dropdown-size-large">
                    <ReactBootstrap.MenuItem value="all" key="All" eventKey="All"
                                             href="#/">all</ReactBootstrap.MenuItem>
                    <Footer_Filtered special="" users={this.props.users}/>
                </ReactBootstrap.DropdownButton>

            </ReactBootstrap.ButtonToolbar>
                <ReactBootstrap.ButtonToolbar key="list2"
                                              className={classNames({selected: this.props.nowShowing === apps.ACTIVE_TODOS})}>
                    <ReactBootstrap.DropdownButton bsSize="large" title="Active" key="list_user"
                                                   id="dropdown-size-large">
                        <ReactBootstrap.MenuItem key="Active" value="active" eventKey="Active"
                                                 href="#/active">all</ReactBootstrap.MenuItem>
                        <Footer_Filtered special="active/" users={this.props.users}/>
                    </ReactBootstrap.DropdownButton>

                </ReactBootstrap.ButtonToolbar><ReactBootstrap.ButtonToolbar key="list3"
                                                                             className={classNames({selected: this.props.nowShowing === apps.COMPLETED_TODOS})}>
                    <ReactBootstrap.DropdownButton bsSize="large" title=" Completed" key="list_user"
                                                   id="dropdown-size-large">
                        <ReactBootstrap.MenuItem key="Completed" value="completed" eventKey="Completed"
                                                 href="#/completed">all</ReactBootstrap.MenuItem>
                        <Footer_Filtered special="completed/" users={this.props.users}/>
                    </ReactBootstrap.DropdownButton>
                </ReactBootstrap.ButtonToolbar>
            </div>
        );
    }
}

/**
 * Le composant pour montrer s'il y a une tâche proche de l'utilisateur dans un element html
 */
class Message extends React.Component {
    constructor() {
        super();
    }

    render() {
        if (this.props.message.length !== 0)
            return <p className="text-info">{this.props.message}</p>;
        else
            return <p/>;
    }
}

/**
 * Le composant pour montrer la liste de taches avec ses états.
 */
class TodoList extends React.Component {
    constructor() {
        super();
        this.state = {
            nowShowing: null,
            nowShowingsuser: null,
        };
    }

    render() {
        const nowShowing = this.props.nowShowing;
        const nowShowingsuser = this.props.nowShowingsuser;
        const props = this.props;

        if (nowShowing !== undefined && nowShowingsuser !== undefined) {
            const shownTodos = this.props.listetodos.filter(function (listetodos) {

                switch (nowShowing) {
                    case apps.ACTIVE_TODOS:
                        if (nowShowingsuser === listetodos.user) {
                            return !listetodos.completed && listetodos.user === nowShowingsuser;
                        } else if (nowShowingsuser === undefined || nowShowingsuser === apps.ALL_TODOS) {
                            return !listetodos.completed;
                        }

                        return false;

                    case apps.COMPLETED_TODOS:
                        if (nowShowingsuser === listetodos.user)
                            return listetodos.completed && listetodos.user === nowShowingsuser;
                        else if (nowShowingsuser === undefined || nowShowingsuser === apps.ALL_TODOS)
                            return listetodos.completed;

                        return false;

                    default:
                        if (nowShowingsuser === listetodos.user)
                            return listetodos.user === nowShowingsuser;
                        else
                            return (nowShowingsuser === undefined || nowShowingsuser === apps.ALL_TODOS);
                }
            });

            const todotems = shownTodos.map(function (listetodos) {

                const listitem = [];
                listitem.push(<TodoListItem key={listetodos.id} item={listetodos}
                                            updateItem={props.updateItem}
                                            removeItem={props.removeItem}/>);

                return (
                    listitem
                )
            });

            return (
                <ul className=" list_todo list-group" key='list'>
                    <Footer nowShowing={this.state.nowShowing} users={this.props.users}/>{todotems}
                </ul>
            );
        }
        return <h1/>
    }
}

/**
 * Le header du menu pour la vue mobile sur tout.
 */
class HeaderMenu extends React.Component {
    render() {

        return (
            <ReactBootstrap.Navbar inverse collapseOnSelect className="navbar-fixed-top">
                <ReactBootstrap.Navbar.Header>
                    <ReactBootstrap.Navbar.Brand>
                        <a href="#">Todo Mobile</a>
                    </ReactBootstrap.Navbar.Brand>
                    <ReactBootstrap.Navbar.Toggle />
                </ReactBootstrap.Navbar.Header>
                <ReactBootstrap.Navbar.Collapse>
                    <ReactBootstrap.Nav>
                        <ReactBootstrap.NavDropdown eventKey={3} title="All" id="basic-nav-dropdown">
                            <ReactBootstrap.MenuItem value="all" key="All" eventKey="All"
                                                     href="#">ALL</ReactBootstrap.MenuItem>
                            <Footer_Filtered special="" users={this.props.users}/>
                        </ReactBootstrap.NavDropdown>
                        <ReactBootstrap.NavDropdown eventKey={3} title="Active" id="basic-nav-dropdown1">
                            <ReactBootstrap.MenuItem value="active" key="active" eventKey="acrtive"
                                                     href="#/active">ALL</ReactBootstrap.MenuItem>
                            <Footer_Filtered special="active/" users={this.props.users}/>
                        </ReactBootstrap.NavDropdown>
                        <ReactBootstrap.NavDropdown eventKey={3} title="Completed" id="basic-nav-dropdown2">
                            <ReactBootstrap.MenuItem value="completed" key="completed" eventKey="completed"
                                                     href="#/completed">ALL</ReactBootstrap.MenuItem>
                            <Footer_Filtered special="completed/" users={this.props.users}/>
                        </ReactBootstrap.NavDropdown>
                    </ReactBootstrap.Nav>
                </ReactBootstrap.Navbar.Collapse>
            </ReactBootstrap.Navbar>

        );

    }
}

/**
 * Le composant principau qui est les père des autres composant, qui a tous les evenements pour ajouter
 * supprimer ou changer les etat des tâches.
 */
const TodoApp = React.createClass({
    mixins: [backboneMixin],

    componentWillMount: function () {
        this.setState({'users': this.props.users, 'msg': ''});
        EVENT.reload.on('tasks', this.loadItems, this);
        EVENT.reload.on('users', this.loadUsers, this);
        EVENT.reload.on('close-tasks', this.tasksClose, this);
    },

    tasksClose: function (obj) {
        obj = JSON.parse(obj);

        if (obj.close) {
            this.setState({msg: "Le tâche " + obj.id + " est proche."});
            navigator.vibrate(1000);
        }
    },

    componentDidMount: function () {
        this.socket = SocketClient;
        this.socket.init();
        SocketClient.getAllTasks();
    },

    loadItems: function (tasks) {
        tasks = JSON.parse(tasks);
        this.setState({'collection': tasks});
    },

    loadUsers: function (users) {
        this.setState({users: JSON.parse(users)});
    },

    addItem: function (task, user, address, rappel, useActualPosition) {
        var self = this;
        this.setState({msg: ''});

        getGeoCoordinates(address, rappel, useActualPosition, function (adresses) {
            self.socket.sendAddTask({
                task: task,
                completed: false,
                user: user,
                long: adresses.long || null,
                lat: adresses.lat || null,
                rappel: rappel
            });

            self.socket.sendAddUser({name: user});
        });
    },

    updateItem: function (id) {
        this.setState({msg: ''});
        this.socket.sendUpdateTask({id: id});
    },

    removeItem: function (idTask) {
        this.setState({msg: ''});
        const item = this.state.collection.filter(function (item) {
            return item.id === idTask;
        })[0];
        this.socket.sendRemoveTask({id: idTask});
        this.socket.sendRemoveUser({name: item.user});
    },

    render: function () {
        return <div>
            <HeaderMenu users={this.state.users}/>
            <TodoBanner qtyTodos={this.state.collection.length}/>
            <TodoForm addItem={this.addItem}/>
            <Message message={this.state.msg}/>
            <TodoList nowShowing={this.state.nowShowing} nowShowingsuser={this.state.nowShowingsuser}
                      listetodos={this.state.collection} updateItem={this.updateItem}
                      removeItem={this.removeItem} users={this.state.users}/>
        </div>;
    }
});

const react = ReactDOM.render(<TodoApp name="todo-app" collection={todoItems} users={users.models}/>,
    document.getElementById('todo'));
const Router = Backbone.Router.extend({

    routes: {
        '': 'all',
        'active': 'active',
        'completed': 'completed',
        'user/:param': 'user',
        'active/user/:param': 'active_user',
        'completed/user/:param': 'completed_user',
    },

    all: function () {
        react.setState({nowShowingsuser: apps.ALL_TODOS});
        react.setState({nowShowing: apps.ALL_TODOS});
    },

    active: function () {
        react.setState({nowShowing: apps.ACTIVE_TODOS});
        react.setState({nowShowingsuser: apps.ALL_TODOS});
    },

    completed: function () {
        react.setState({nowShowing: apps.COMPLETED_TODOS});
        react.setState({nowShowingsuser: apps.ALL_TODOS});

    },

    user: function (param) {
        if (typeof param !== 'undefined' && param !== null) {
            react.setState({nowShowingsuser: param});
        }
    },

    active_user: function (param) {
        react.setState({nowShowing: apps.ACTIVE_TODOS});
        react.setState({nowShowingsuser: param});
    },

    completed_user: function (param) {
        react.setState({nowShowing: apps.COMPLETED_TODOS});
        react.setState({nowShowingsuser: param});
    }
});

const router = new Router();
Backbone.history.start();