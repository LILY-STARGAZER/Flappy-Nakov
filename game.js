/**
 * Created by gondarslol on 7/25/2014.
 */
//creating the variables of the game

//-----------------------------
//Key Presses                 /
//-----------------------------
var keyPressList = [];
//-----------------------------

//-----------------------------
//Images               /
//-----------------------------
gameBackground = new Image();
//TODO: change picture
gameBackground.src = "res/gameBackground.jpg";
//-----------------------------

//-----------------------------
// Canvas Size                /
// ----------------------------
var xMin = 0;
var xMax = 520;
var yMin = 0;
var yMax = 400;
//-----------------------------


var
    selectedOptions = 0,
    playNewGame = false,
    canvas,
    ctx,
    width,
    height,
    fgpos = 0,


    frames = 0,
    score = 0,
    best = 0,

    currentState,
    states = {
        Menu: 0, Splash: 1, Game: 2, Score: 3
    },
    okbtn,


//giving the bird start position, animations from the sheet and gravity
    bird = {

        x: 60,
        y: 0,
        frame: 0,
        velocity: 0,
        radius: 12,
        animation: [0, 1, 2, 1],
        rotation: 0,
        gravity: 0.25,
        _jump: 4.6,


//creating the jump function for the bird
        jump: function () {
            this.velocity = -this._jump;
        },
//update function - for initializing the current state + movements
        update: function () {
            var n = currentState === states.Splash ? 10 : 5;
            this.frame += frames % n === 0 ? 1 : 0;
            this.frame %= this.animation.length;

            if (currentState === states.Splash) {
                this.y = height - 280 + 5 * Math.cos(frames / 10);
                this.rotation = 0;
            } else if (currentState === states.Game) {
                this.velocity += this.gravity;
                this.y += this.velocity;

                if (this.y >= height - s_fg.height - 10) {
                    this.y = height - s_fg.height - 10;
                    if (currentState === states.Game) {
                        currentState = states.Score;
                    }
                    this.velocity = this._jump;
                }

                if (this.velocity >= this._jump) {
                    this.frame = 1;
                    this.rotation = Math.min(Math.PI / 2, this.rotation + 0.3);
                } else {
                    this.rotation = -0.3;
                }
            } else if (currentState === states.Menu) {
                stateMainMenu();

            }
        },
//drawing the bird onto the ctx
        draw: function (ctx) {

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
            ctx.stroke();
            var n = this.animation[this.frame];
            s_bird[n].draw(ctx, -s_bird[n].width / 2, -s_bird[n].height / 2);

            ctx.restore();

        }
    },
//creating pipe physics and spawns
    pipes = {

        _pipes: [],
//reset function after game ends
        reset: function () {
            this._pipes = [];
        },
//refresh function for the pipes + making them appear randomly
        update: function () {
            if (frames % 100 === 0) {
                var _y = height - (s_pipeSouth.height + s_fg.height + 120 + 200 * Math.random());
                this._pipes.push({
                    x: 500,
                    y: _y,
                    width: s_pipeSouth.width,
                    height: s_pipeSouth.height
                });
            }
            for (var i = 0, len = this._pipes.length; i < len; i++) {
                var p = this._pipes[i];

                if (i === 0) {

                    score += p.x === bird.x ? 1 : 0;


                    var cx = Math.min(Math.max(bird.x, p.x), p.x + p.width);
                    var cy1 = Math.min(Math.max(bird.y, p.y), p.y + p.height);
                    var cy2 = Math.min(Math.max(bird.y, p.y + p.height + 80), p.y + 2 * p.height + 80);

                    var dx = bird.x - cx;
                    var dy1 = bird.y - cy1;
                    var dy2 = bird.y - cy2;

                    var d1 = dx * dx + dy1 * dy1;
                    var d2 = dx * dx + dy2 * dy2;

                    var r = bird.radius * bird.radius;

                    if (r > d1 || r > d2 || bird.y < -50) {
                        currentState = states.Score;
                    }
                }
                p.x -= 2;
                if (p.x < -50) {
                    this._pipes.splice(i, 1);
                    i--;
                    len--;
                }
            }
        },
//drawing the pipes
        draw: function (ctx) {

            for (var i = 0, len = this._pipes.length; i < len; i++) {
                var p = this._pipes[i];
                s_pipeSouth.draw(ctx, p.x, p.y);
                s_pipeNorth.draw(ctx, p.x, p.y + 80 + p.height);

            }
        }
    };
//creating the eventlistener
function onpress(evt) {

    switch (currentState) {
        case states.Menu:
            break;
        case states.Splash:
            currentState = states.Game;
            bird.jump();
            break;
        case states.Game:
            bird.jump();
            break;
        case states.Score:
            var mx = evt.offsetX, my = evt.offsetY;
            if (mx == null || my == null) {
                mx = evt.touches[0].clientX;
                my = evt.touches[0].clientY;
            }
            if (okbtn.x < mx && mx < okbtn.x + okbtn.width &&
                okbtn.y < my && my < okbtn.y + okbtn.height) {
                pipes.reset();
                currentState = states.Splash;
                score = 0;
            }
            break;
    }
}
//main function for the game
function main() {
    canvas = document.createElement("canvas");

    width = window.innerWidth;
    height = window.innerHeight;
    var evt = "touches";
    if (width >= 500) {
        width = 320;
        height = 480;
        canvas.style.border = "1px black solid";
        evt = "mousedown";
    }

    document.addEventListener(evt, onpress);

    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext("2d");

    currentState = states.Menu;


    document.body.appendChild(canvas);

    var img = new Image();
    img.onload = function () {
        initSprites(this);
        ctx.fillStyle = s_bg.color;

        okbtn = {
            x: (width - s_buttons.Ok.width) / 2,
            y: height - 200,
            width: s_buttons.Ok.width,
            height: s_buttons.Ok.height
        }
        run();
    }
    img.src = "res/sheet.png"
}
//run function
function run() {
    var loop = function () {
        console.log("Looping");
        if (currentState === states.Menu) {
            stateMainMenu();
        } else {
            update();
            render();
            window.requestAnimationFrame(loop, canvas);
        }
    }
    window.requestAnimationFrame(loop, canvas);
}
//refresh/update function
function update() {
    frames++;

    if (currentState !== states.Score) {
        fgpos = (fgpos - 2) % 14;
    } else {
        best = Math.max(best, score);
    }
    if (currentState === states.Game) {
        pipes.update();
    }

    bird.update();

}
//rendering(drawing) function
function render() {
    ctx.fillRect(0, 0, width, height);
    s_bg.draw(ctx, 0, height - s_bg.height);
    s_bg.draw(ctx, s_bg.width, height - s_bg.height);

    pipes.draw(ctx);
    bird.draw(ctx);


    s_fg.draw(ctx, fgpos, height - s_fg.height);
    s_fg.draw(ctx, fgpos + s_fg.width, height - s_fg.height);

    var width2 = width / 2;

    if (currentState === states.Splash) {
        s_splash.draw(ctx, width2 - s_splash.width / 2, height - 300);
        s_text.GetReady.draw(ctx, width2 - s_text.GetReady.width / 2, height - 380);
    }

    if (currentState === states.Score) {
        s_text.GameOver.draw(ctx, width2 - s_text.GameOver.width / 2, height - 400);
        s_score.draw(ctx, width2 - s_score.width / 2, height - 340);
        s_buttons.Ok.draw(ctx, okbtn.x, okbtn.y);

        s_numberS.draw(ctx, width2 - 47, height - 304, score, null, 10);
        s_numberS.draw(ctx, width2 - 47, height - 262, best, null, 10);
    } else {
        s_numberB.draw(ctx, null, 20, score, width2);
    }
}


function stateMainMenu() {
    renderGameBackground(0.4);
    switch (menuNav) {
        case "Main":
            mainMenu();
            break;
        case "How To Play":
            howToPlay();
            break;
        case "gameOptions":
            gameOptions();
            break;
        case "About":
            about();
            break;
    }

    console.log(playNewGame);
    if (playNewGame) {
        currentState = states.Game;
        run();
        playNewGame = false;
    }
}


// ------ GAME MENU -----------
var menuNav = "Main";

function mainMenuSelector() {
    if (keyPressList[38] == true) {
        if (selectedOptions > 0) {
            selectedOptions--;
            keyPressList[38] = false;
        } else if (selectedOptions == 0) {
            selectedOptions = 3;
            keyPressList[38] = false;
        }
    }

    if (keyPressList[40] == true) {
        if (selectedOptions < 3) {
            selectedOptions++;
            keyPressList[40] = false;
        } else if (selectedOptions == 3) {
            selectedOptions = 0;
            keyPressList[40] = false;
        }
    }

    if (keyPressList[13] == true) {
        switch (selectedOptions) {
            case 0:
                playNewGame = true;
                keyDown = true;
                break;
            case 1:
                menuNav = "gameOptions";
                selectedOptions = 0;
                keyPressList[13] = false;
                break;
            case 2:
                menuNav = "How To Play";
                keyPressList[13] = false;
                break;
            case 3:
                menuNav = "About";
                keyPressList[13] = false;
                break;
        }
    }
}


function mainMenu() {
    mainMenuSelector();
    drawMainMenu();
}

function drawMainMenu() {
    var menuOptions = ["New Game", "Options", "How To Play", "About"];
    var xCoords = [220, 233, 213, 239];
    var yCoords = [100, 140, 180, 220];
    for (var i = 0; i < 4; i++) {
        ctx.save();
        if (selectedOptions == i)
            ctx.fillStyle = 'rgb(255,255,255)';
        else
            ctx.fillStyle = 'rgb(85,155,130)';
        ctx.font = '15px red';
        ctx.textBaseline = 'top';
        castShadow(0, 0, 'white', 20);
        ctx.fillText(menuOptions[i], xCoords[i], yCoords[i]);
        ctx.restore();
    }
}

document.onkeydown = function (e) {

    e = e ? e : window.event;
    keyPressList[e.keyCode] = true;
    stateMainMenu();
}


document.onkeyup = function (e) {
    e = e ? e : window.event;
    keyPressList[e.keyCode] = false;
    keyDown = false;
}

function renderGameBackground(backgroundAlpha) {
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(xMin, yMin, xMax, yMax);
    ctx.globalAlpha = backgroundAlpha;
    castShadow(0, 0, 'rgb(10,93,85)', 20);
    ctx.drawImage(gameBackground, 0, 0);
    ctx.restore();
}

function castShadow(OffsetX, OffsetY, Color, Blur) {
    ctx.shadowOffsetX = OffsetX;
    ctx.shadowOffsetY = OffsetY;
    ctx.shadowColor = Color;
    ctx.shadowBlur = Blur;
}

main(); // starting the game with it