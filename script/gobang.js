/**
 * Created by junxiachen on 17/8/30.
 */
function Dot(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
}

function Board() {
}

Board.prototype = {
    constructor: Board,
    /**
     * 初始化棋盘
     * @param id      棋盘canvas的id
     * @param bg_id   棋盘背景canvas的id
     * cell           每个小格宽度
     * padding        棋盘边距
     * player         玩家:黑色/白色
     * dots           已存在的棋子
     * dot_radius     棋子半径
     * play_with_computer    是否人机模式
     * win_methods    赢法数组[x坐标][y坐标][第几种赢法]
     * win_count      赢法总数
     */
    init: function (id, bg_id) {
        this.id = id;
        this.bg_id = bg_id;
        this.cell = 40;
        this.padding = 20;
        this.player = 'black';
        this.dots = [];
        this.dot_radius = 13;
        this.last_dot = {};
        this.play_with_computer = true;
        this.win_methods = [];
        this.win_count = 0;
        this.black_win = [];
        this.white_win = [];
    },
    reset: function (with_computer) {
        var canvas = document.getElementById(this.id);
        canvas.height = canvas.height;
        this.player = 'white';
        this.dots = [];
        this.last_dot = {};
        this.play_with_computer = with_computer;
        this.win_count = 0;
        this.togglePlayer();
        this.initWinMethods();
    },
    drawBoard: function () {
        var canvas = document.getElementById(this.bg_id);
        if (!canvas.getContext) return;
        var ctx = canvas.getContext('2d');

        for (var i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.moveTo(this.padding + i * this.cell, this.padding);
            ctx.lineTo(this.padding + i * this.cell, this.padding + this.cell * 14);
            ctx.stroke();
        }

        for (var i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.moveTo(this.padding, this.padding + i * this.cell);
            ctx.lineTo(this.padding + this.cell * 14, this.padding + i * this.cell);
            ctx.stroke();
        }

        var bg_dots = [{x: 3, y: 3}, {x: 3, y: 11}, {x: 7, y: 7}, {x: 11, y: 3}, {x: 11, y: 11}];
        for (var i = 0, len = bg_dots.length; i < len; i++) {
            ctx.beginPath();
            var x = this.padding + bg_dots[i].x * this.cell;
            var y = this.padding + bg_dots[i].y * this.cell;
            ctx.arc(x, y, 4, 0, Math.PI * 2, false);
            ctx.fill();
        }
    },
    drawDot: function (x, y) {
        //判断该位置棋子是否已存在在棋盘中
        if (this.getColorOfPosition(x, y))return;

        var canvas = document.getElementById(this.id);
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        var draw_x = this.padding + x * this.cell;
        var draw_y = this.padding + y * this.cell;
        ctx.arc(draw_x, draw_y, this.dot_radius, 0, Math.PI * 2, false);
        var g = ctx.createRadialGradient(draw_x, draw_y, this.dot_radius, draw_x, draw_y, 0);
        if(this.player == 'black'){
            g.addColorStop(0,'#000');
            g.addColorStop(1,'#636766');
        }else {
            g.addColorStop(0,'#D1D1D1');
            g.addColorStop(1,'#fff');
        }
        ctx.fillStyle = g;
        ctx.fill();

        var dot = new Dot(x, y, this.player);
        this.dots.push(dot);
        this.last_dot = {x: x, y: y};

        if (this.judgeWin(x, y)) {
            this.showWinInformation();
            this.player = this.player == 'black' ? 'white' : 'black';
        } else if (this.player == 'black' && this.play_with_computer) {
            this.togglePlayer();
            this.drawDotByComputer(x, y);
        } else {
            this.togglePlayer();
        }

        if (this.play_with_computer) {
            document.getElementById('chess_btn').style.display = 'none';
            document.getElementById('cancel_btn').style.display = 'none';
        } else {
            document.getElementById('chess_btn').style.display = 'inline';
            document.getElementById('cancel_btn').style.display = 'none';
        }
    },
    drawDotByComputer: function (x, y) {
        var max_score = 0;
        var black_score = 0;
        var white_score = 0;
        var best_x = 0;
        var best_y = 0;

        //计算黑方落子赢法种数
        for (var i = 0; i < this.win_count; i++) {
            if (this.win_methods[x][y][i]) {
                this.black_win[i]++;
                this.white_win[i] = 6;
            }
        }

        //如果棋盘上有空位可以落子,则计算该位置得分
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 15; j++) {
                if (this.getColorOfPosition(i, j))continue;

                black_score = 0;
                white_score = 0;
                for (var k = 0; k < this.win_count; k++) {
                    //落在该位置可得分
                    if (!this.win_methods[i][j][k]) continue;

                    if (this.black_win[k] == 1) {
                        black_score += 200;
                    } else if (this.black_win[k] == 2) {
                        black_score += 400;
                    } else if (this.black_win[k] == 3) {
                        if (this.white_win[k] == 1) {
                            black_score += 1500;
                        } else {
                            black_score += 4000;
                        }
                    } else if (this.black_win[k] == 4) {
                        black_score += 6000;
                    }

                    if (this.white_win[k] == 1) {
                        white_score += 220;
                    } else if (this.white_win[k] == 2) {
                        white_score += 1000;
                    } else if (this.white_win[k] == 3) {
                        white_score += 3000;
                    } else if (this.white_win[k] == 4) {
                        white_score += 20000;
                    }

                }

                //计算黑方落子得分最高的点
                if (black_score > max_score) {
                    best_x = i;
                    best_y = j;
                    max_score = black_score;
                }

                if (white_score > max_score) {
                    best_x = i;
                    best_y = j;
                    max_score = white_score;
                }
            }
        }


        for (var i = 0; i < this.win_count; i++) {
            if (this.win_methods[best_x][best_y][i]) {
                this.white_win[i]++;
                this.black_win[i] = 6;
            }
        }
        this.drawDot(best_x, best_y);

    },
    initWinMethods: function () {
        //赢法总数
        for (var i = 0; i < 15; i++) {
            this.win_methods[i] = [];
            for (var j = 0; j < 15; j++) {
                this.win_methods[i][j] = [];
            }
        }

        //水平方向赢法计算
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    this.win_methods[i][j + k][this.win_count] = true;
                }
                this.win_count++;
            }
        }

        //竖直方向
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    this.win_methods[j + k][i][this.win_count] = true;
                }
                this.win_count++;
            }
        }

        //左上到右下方向
        for (var i = 0; i < 11; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    this.win_methods[i + k][j + k][this.win_count] = true;
                }
                this.win_count++;
            }
        }

        //从右上到左下方向
        for (var i = 4; i < 15; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    this.win_methods[i - k][j + k][this.win_count] = true;
                }
                this.win_count++;
            }
        }


        for (var i = 0; i < this.win_count; i++) {
            this.black_win[i] = 0;
            this.white_win[i] = 0;
        }
    },
    startGame: function (with_computer) {
        this.reset(with_computer);

        var _this = this;
        var canvas = document.getElementById(this.id);
        canvas.onclick = function () {
            if (_this.player == 'white' && _this.play_with_computer)
                return;

            var e = event || window.event;
            if (e.offsetX < _this.dot_radius / 2 || e.offsetY < _this.dot_radius / 2)
                return;
            var x = Math.floor((e.offsetX - _this.dot_radius / 2) / _this.cell);
            var y = Math.floor((e.offsetY - _this.dot_radius / 2) / _this.cell);
            _this.drawDot(x, y);
        };
        document.getElementById('start_btn').disabled = true;
        document.getElementById('start_computer_btn').disabled = true;
        document.getElementById('explain').innerText = this.player == 'black' ? '黑方执棋' : '白方执棋';
    },
    togglePlayer: function () {
        this.player = this.player == 'black' ? 'white' : 'black';
        document.getElementById('explain').innerText = this.player == 'black' ? '黑方执棋' : '白方执棋';
    },
    judgeWin: function (x, y) {

        var win_flag;
        //判断水平方向是否胜利
        for (var i = 0; i < 5; i++) {
            if (x - i < 0)continue;
            win_flag = true;
            for (var j = 0; j < 5; j++) {
                if (x - i + j > 14) {
                    win_flag = false;
                } else if (this.getColorOfPosition(x - i + j, y) != this.player) {
                    win_flag = false;
                }
            }
            if (win_flag) {
                return true;
            }
        }

        //判断竖直方向是否胜利
        for (var i = 0; i < 5; i++) {
            if (y - i < 0)continue;
            win_flag = true;
            for (var j = 0; j < 5; j++) {
                if (y - i + j > 14) {
                    win_flag = false;
                } else if (this.getColorOfPosition(x, y - i + j) != this.player) {
                    win_flag = false;
                }
            }
            if (win_flag) {
                return true;
            }
        }

        //判断斜方向(左上到右下)
        for (var i = 0; i < 5; i++) {
            if (x - i < 0 || y - i < 0)continue;
            win_flag = true;
            for (var j = 0; j < 5; j++) {
                if (x - i + j > 14 || y - i + j > 14) {
                    win_flag = false;
                } else if (this.getColorOfPosition(x - i + j, y - i + j) != this.player) {
                    win_flag = false;
                }
            }
            if (win_flag) {
                return true;
            }
        }

        //判断斜方向(右上到左下)
        for (var i = 0; i < 5; i++) {
            if (x + i > 14 || y - i < 0)continue;
            win_flag = true;
            for (var j = 0; j < 5; j++) {
                if (x + i - j < 0 || y - i + j > 14) {
                    win_flag = false;
                } else if (this.getColorOfPosition(x + i - j, y - i + j) != this.player) {
                    win_flag = false;
                }
            }
            if (win_flag) {
                return true;
            }
        }

        return false;
    },
    chess: function () {
        var canvas = document.getElementById(this.id);
        var ctx = canvas.getContext('2d');
        var draw_x = this.padding + this.last_dot.x * this.cell - this.dot_radius;
        var draw_y = this.padding + this.last_dot.y * this.cell - this.dot_radius;
        ctx.clearRect(draw_x, draw_y, 2 * this.dot_radius, 2 * this.dot_radius);

        for (var i = 0, len = this.dots.length; i < len; i++) {
            if (this.dots[i].x == this.last_dot.x && this.dots[i].y == this.last_dot.y)
                this.dots.splice(i, 1);
        }

        document.getElementById('chess_btn').style.display = 'none';
        document.getElementById('cancel_btn').style.display = 'inline';
        document.getElementById('start_btn').disabled = true;
        this.togglePlayer();

        var _this = this;
        canvas.onclick = function () {
            var e = event || window.event;
            var x = Math.floor((e.offsetX - _this.padding / 2) / _this.cell);
            var y = Math.floor((e.offsetY - _this.padding / 2) / _this.cell);
            _this.drawDot(x, y);
        };
    },
    cancelChess: function () {
        document.getElementById('chess_btn').style.display = 'inline';
        document.getElementById('cancel_btn').style.display = 'none';
        this.drawDot(this.last_dot.x, this.last_dot.y);
    },
    getColorOfPosition: function (x, y) {
        for (var i = 0, len = this.dots.length; i < len; i++) {
            if (this.dots[i].x == x && this.dots[i].y == y) {
                return this.dots[i].color;
            }
        }
    },
    showWinInformation: function () {
        document.getElementById(this.id).onclick = null;
        document.getElementById('explain').innerHTML = this.player == 'black' ? '<span>黑方胜利</span>' : '<span>白方胜利</span>';
        document.getElementById('start_btn').disabled = false;
        document.getElementById('start_computer_btn').disabled = false;
    }
};
