﻿var app = angular.module('snakeGame', []);

app.controller('gameController', function ($scope, $timeout, $window) {
    var interval, tempDirection, isGameOver;
    $scope.score = 0;
    $scope.highScore = (localStorage.getItem("highScore") === null)  ? 0 : localStorage.getItem("highScore");
    var BOARD_SIZE = 16;

    var compareAndStoreHighestScore = function () {
        if (null === localStorage.getItem("highScore")) {
            $scope.highScore = $scope.score;
            localStorage.setItem("highScore", $scope.score);
        } else {
            if (localStorage.getItem("highScore") > $scope.score) {
                localStorage.setItem("highScore", $scope.score);
                $scope.highScore = $scope.score
            }

        }
    }

    /* Key stroke codes for directions */     
        var DIRECTIONS = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };

        var COLORS = {
            GAME_OVER: '#820303',
            FEED: '#bfbfbf',
            SNAKE_HEAD: '#00cc66',
            SNAKE_BODY: '#0DFF00',
            BOARD: '#339966'
        };

        var snake = {
            direction: DIRECTIONS.LEFT,
            parts: [{
                x: -1,
                y: -1
            }]
        };

        var fruit = {
            x: -1,
            y: -1
        };



        $scope.setStyling = function (col, row) {
            if (isGameOver) {
                return COLORS.GAME_OVER;
            } else if (fruit.x == row && fruit.y == col) {
                return COLORS.FEED;
            } else if (snake.parts[0].x == row && snake.parts[0].y == col) {
                return COLORS.SNAKE_HEAD;
            } else if ($scope.board[col][row] === true) {
                return COLORS.SNAKE_BODY;
            }
            return COLORS.BOARD;
        };

        var update= function () {
            var newHead = UpdateSnakeHeight();

            if (boardCollision(newHead) || selfCollision(newHead)) {
                return gameOver();
            } else if (fruitCollision(newHead)) {
                catchFood();
            }

            // Remove tail
            var oldTail = snake.parts.pop();
            $scope.board[oldTail.y][oldTail.x] = false;

            // Pop tail to head
            snake.parts.unshift(newHead);
            $scope.board[newHead.y][newHead.x] = true;

            // Do it again
            snake.direction = tempDirection;
            $timeout(update, interval);
        }

        function UpdateSnakeHeight() {
            var newHead = angular.copy(snake.parts[0]);

            // Update Location
            if (tempDirection === DIRECTIONS.LEFT) {
                newHead.x -= 1;
            } else if (tempDirection === DIRECTIONS.RIGHT) {
                newHead.x += 1;
            } else if (tempDirection === DIRECTIONS.UP) {
                newHead.y -= 1;
            } else if (tempDirection === DIRECTIONS.DOWN) {
                newHead.y += 1;
            }
            return newHead;
        }

        function boardCollision(part) {
            return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
        }

        function selfCollision(part) {
            return $scope.board[part.y][part.x] === true;
        }

        function fruitCollision(part) {
            return part.x === fruit.x && part.y === fruit.y;
        }

        function resetFruit() {
            var x = Math.floor(Math.random() * BOARD_SIZE);
            var y = Math.floor(Math.random() * BOARD_SIZE);

            if ($scope.board[y][x] === true) {
                return resetFruit();
            }
            fruit = { x: x, y: y };
        }

        var catchFood =  function () {
            $scope.score++
            if ($scope.highScore < $scope.score) {
                $scope.highScore = $scope.score ;
            }
            // Grow by 1
            var tail = angular.copy(snake.parts[snake.parts.length - 1]);
            snake.parts.push(tail);
            resetFruit();
        }

        var gameOver = function () {
            isGameOver = true;

            $timeout(function () {
                isGameOver = false;
            }, 500);
            compareAndStoreHighestScore();
            boardInit();
        }
      
        var boardInit = function () {
            $scope.board = [];
            for (var i = 0; i < BOARD_SIZE; i++) {
                $scope.board[i] = [];
                for (var j = 0; j < BOARD_SIZE; j++) {
                    $scope.board[i][j] = false;
                }
            }
        }
        boardInit();

        $window.addEventListener("keyup", function (e) {
            if (e.keyCode == DIRECTIONS.LEFT && snake.direction !== DIRECTIONS.RIGHT) {
                tempDirection = DIRECTIONS.LEFT;
            } else if (e.keyCode == DIRECTIONS.UP && snake.direction !== DIRECTIONS.DOWN) {
                tempDirection = DIRECTIONS.UP;
            } else if (e.keyCode == DIRECTIONS.RIGHT && snake.direction !== DIRECTIONS.LEFT) {
                tempDirection = DIRECTIONS.RIGHT;
            } else if (e.keyCode == DIRECTIONS.DOWN && snake.direction !== DIRECTIONS.UP) {
                tempDirection = DIRECTIONS.DOWN;
            }
        });

        $scope.startGame = function () {
            $scope.score = 0;
            snake = { direction: DIRECTIONS.LEFT, parts: [] };
            tempDirection = DIRECTIONS.LEFT;
            isGameOver = false;
            interval = 200;

            // Set up initial snake
            for (var i = 0; i < 5; i++) {
                snake.parts.push({ x: 10 + i, y: 10 });
            }
            resetFruit();
            update();
        };

    });