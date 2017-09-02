/**
 * Created by junxiachen on 17/8/30.
 */
var gobang = new Board();
gobang.init('gobang', 'gobang_bg');
gobang.drawBoard();

function start(with_computer) {
    gobang.startGame(with_computer);
}

function chess() {
    gobang.chess();
}

function cancelChess() {
    gobang.cancelChess();
}