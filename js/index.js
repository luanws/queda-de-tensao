const $ = require('jquery');
const electron = require('electron');
const fs = require('fs');
const remote = electron.remote;
const dialog = remote.dialog;
const BrowserWindow = remote.BrowserWindow;
const Menu = remote.Menu;

let componentes = [];
let componentesDeletados = [];

Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
        label: 'File',
        submenu: [
            { id: 'novo', label: 'Novo', click: () => { } },
            {
                id: 'abrir', label: 'Abrir', click: () => {
                    dialog.showOpenDialog(caminho => {
                        fs.readFile(caminho + '', 'utf-8', (erro, conteudo) => {
                            if (!erro) {
                                componentes = JSON.parse(conteudo);
                                componentes.forEach(componente => {
                                    componente.addMain();
                                });
                            }
                            else console.log(erro.message);
                        });
                    });
                }
            },
            { type: 'separator' },
            {
                id: 'salvar', label: 'Salvar', click: () => {
                    dialog.showSaveDialog(caminho => {
                        if (caminho.indexOf('.qt') == -1) caminho = caminho + '.qt';

                        fs.writeFile(caminho, JSON.stringify(componentes), e => {
                            if (!e) alert('Salvo com sucesso');
                            else alert('Erro ao salvar');
                        });
                    });
                }
            },
            { type: 'separator' },
            {
                label: 'Sair',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Desenvolvedor',
        submenu: [
            {
                role: 'toggledevtools'
            },
            {
                role: 'reload'
            }
        ]
    }
]));

Array.prototype.top = function () {
    return this[this.length - 1];
}

class Componente extends NoArvore {
    constructor(tipo, id) {
        super(id)
        this.dom = $('<div>')
            .addClass('componente')
            .addClass('bg-primary')
            .addClass('seguir-mouse')
            .css('position', 'absolute')

        this.tipo = tipo;
        this.attrs = [];

        const main = $('#main');

        main.append(this.dom).mousemove(e => {
            if (this.dom.hasClass('seguir-mouse')) {
                let x = e.clientX;
                let y = e.clientY;

                x -= parseInt(this.dom.css('width').replace('px', '')) / 2;
                y -= parseInt(this.dom.css('height').replace('px', '')) / 2;

                this.dom.css('left', x).css('top', y);
            }
        });

        main.click(e => {
            if (this.dom.hasClass('seguir-mouse')) {
                this.dom.removeClass('seguir-mouse');

                this.dom.dblclick(e => {
                    this.abrirConfiguracoes();
                });

                console.log(this.getX(), this.getY());
            }
        });
    }

    addMain() {
        $('#main').append(this.dom);
    }

    setX(x) {
        this.dom.css('left', x);
    }

    setY(y) {
        this.dom.css('top', y);
    }

    getX() {
        return parseInt(this.dom.css('left').replace('px', ''));
    }

    getY() {
        return parseInt(this.dom.css('top').replace('px', ''));
    }

    setVisible(bool) {
        if (bool) this.dom.css('display', 'block');
        else this.dom.css('display', 'none')
    }

    addMain() {
        $('#main').append(this.dom);
    }

    abrirConfiguracoes() {
        localStorage.setItem('componente', JSON.stringify(this));

        const config = new BrowserWindow({
            title: 'Configurações do componente',
            width: 400, height: 300,
            autoHideMenuBar: true,
            icon: './img/icon.png',
            show: false,
            webPreferences: {
                nodeIntegration: true
            },
            resizable: false
        });

        config.loadFile('./windows/config-componentes.html');

        config.once('ready-to-show', () => {
            config.show();
        });

        config.once('close', () => {
            const message = localStorage.getItem('componente');

            if (message != '') {
                const config = JSON.parse(message);
                const attrs = config.attrs;
                this.id = config.id;

                switch (this.tipo) {
                    case 'transformador':
                        this.attrs = { pa: attrs.pa, ca: attrs.ca, fa: attrs.fa }
                        break;

                    case 'nó':
                        this.attrs = { 'ca': attrs.ca }
                        break;
                }

                console.log('Componente configurado', this);
            }
            else {
                console.log('Configuração cancelada');
            }
        });
    }
}

class Transformador extends Componente {
    constructor() {
        super('transformador', 'T');

        this.dom.addClass('transformador');
    }
}

class No extends Componente {
    constructor() {
        super('nó', 'N');

        this.dom.addClass('no');
    }
}

class Cabo {
    constructor(xi, yi, xf, yf) {
        const canvas = document.createElement('canvas');
        this.dom = $(canvas);
        this.dom.css('background-color', 'green');
        this.dom.css('width', xf - xi);
        this.dom.css('height', yf - yi);
        this.context = canvas.getContext('2d');
        this.context.lineWidth = 10;
        this.context.lineTo(xi, yi);
        this.context.lineTo(xf, yf);
        this.context.stroke();

        this.main = $('#main');
        this.main.append(this.dom);
    }
}

new Cabo(0, 0, 100, 100);


$('.componente').click(e => {
    switch (e.target.id) {
        case 'transformador':
            componentes.push(new Transformador());
            break;

        case 'no':
            componentes.push(new No());
    }
});

$(document).keypress(key => {
    switch (key.keyCode) {
        case 26: // Ctrl + z
            if (componentes.length > 0) {
                let componente = componentes.pop();
                componente.setVisible(false);
                componentesDeletados.push(componente);
            }
            break;

        case 25: // Ctrl + y
            if (componentesDeletados.length > 0) {
                let componente = componentesDeletados.pop();
                componente.setVisible(true);
                componentes.push(componente);
            }
            break;
    }

    console.log(key.keyCode);
});