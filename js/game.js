const {Engine, World, Bodies, Constraint, Composites, Body, MouseConstraint, Mouse} = Matter;
let world, engine, ball, walls = [], mConstraint, ss;
let dc = false, s = 0, time = 60, game = false, start = true;

class Rect{
    constructor(x, y, w, h, dy, ops){
        this.body = Bodies.rectangle(x, y, w, h, ops);
        World.add(world, this.body);
        this.w = w;
        this.h = h;
        this.dy = dy;
        this.ang = this.body.angle;
        this.pos = this.body.position;
    }

    draw(){
        push();
        translate(this.pos.x, this.pos.y)
        rotate(this.ang)
        fill(0, 0, 255);
        stroke('grey')
        rectMode(CENTER);
        rect(0, 0, this.w, this.h);
        pop();
    }

    update(){
        if(this.pos.y + this.h / 2 > height || this.pos.y < this.h / 2)
            this.dy *= -1;
        Body.translate(this.body, {x: 0, y: this.dy})
        this.draw();
    }
}

class HoleWall{
    constructor(x, y, w, h){
        this.bodyUpper = Bodies.rectangle(x, y - 325, w, h)
        this.bodyLower = Bodies.rectangle(x, y + 325, w, h)
        this.dy = 3

        this.compoundBody = Body.create({
            parts: [this.bodyUpper, this.bodyLower],
            isStatic: true,
            restitution: 1
        })

        World.add(world, this.compoundBody)
    }

    drawVertices(vertices){
        beginShape();
        for (var i = 0; i < vertices.length; i++) {
            vertex(vertices[i].x, vertices[i].y);
        }
        endShape(CLOSE);
    }

    show(){
        this.drawVertices(this.bodyUpper.vertices)
        this.drawVertices(this.bodyLower.vertices)
    }

    update(){
        if(this.compoundBody.position.y > height - 100 || this.compoundBody.position.y < 100)
            this.dy *= -1
        Body.translate(this.compoundBody, {x: 0, y: this.dy})
        this.show()
    }
}

class Ball{
    constructor(x, y, r){
        this.body = Bodies.circle(x, y, r / 2, {restitution: 0.5});
        World.add(world, this.body);
        this.r = r;
        this.pos = this.body.position;
    }

    draw(){
        push();
        const pos = this.body.position;
        const angle = this.body.angle;
        translate(pos.x, pos.y)
        rotate(angle)
        fill(255);
        rectMode(CENTER);
        circle(0, 0, this.r);
        pop();
    }

    ofScreen(){
        return this.pos.y - this.r > height || this.pos.y + this.r < 0 || this.pos.x + this.r < 0 || this.goal()
    }

    goal(){
        return this.pos.x - this.r > width
    }

    update(){
        if(this.ofScreen()){
            World.remove(world, this.body)
            ball = new Ball(200, height / 2 + 100, 50)
            ss.attach(ball.body)
        }

        if(this.goal())
            s += 5

        this.draw();
    }
}

class SlingShot{
    constructor(x, y, body){
        const options = {
            pointA: {
                x: x,
                y: y
            },
            bodyB: body,
            stiffness: 0.05,
            length: 40
        }
        this.sling = Constraint.create(options)
        World.add(world, this.sling)
    }

    attach(body){
        this.sling.bodyB = body
    }

    fly(){
        this.sling.bodyB = null
    }

    draw(){
        stroke('grey')
        const posA = this.sling.pointA;
        const posB = this.sling.bodyB.position
        line(posA.x, posA.y, posB.x, posB.y)
    }

    update(){
        if(this.sling.bodyB)
            this.draw()
    }
}

function mouseReleased(){
    if(dc)
        setTimeout(() => ss.fly(), 50)
}

let int = setInterval(() => {
    if(time > 0)
        time--
}, 1000)

function keyPressed(){
    if((key == 'R' || key == 'r') && !game)
        reset()

    if(key && !game && start){
        start = false
        game = true
        time = 60
    }

}

function score(){
    push();
    fill(0,255,0,230);
    noStroke();
    textSize(40);
    if(game)
        text(s, 100, 60);
    else if(!game && !start)
        text("Your Score: " + s, width / 2 - 100, 60);
    pop();
}

function timer(){
    push()
    fill(255, 0, 0, 230)
    textSize(40)
    noStroke()
    text(time, width / 2 - 22, 60)
    pop()
}

function gameplay(){
    push();
    background(235)
    fill(255,0,0);
    noStroke();
    textSize(80)
    text("Hole in the Wall", width / 2 - 275, height / 2 - 200);
    textSize(50);
    text("Instructions", width / 2 - 150, height / 2 - 100);
    textSize(30);
    text("You have to Aim the Gaps between the walls to get a Score", width / 2 - 375, height / 2 - 40);
    text("Each Successful hit will give you 5 points", width / 2 - 250, height / 2 + 10);
    text("Whenever the ball goes offScreen you will get another one immediately", width / 2 - 425, height / 2 + 60);
    text("You have one minute to make your high Score", width / 2 - 300, height / 2 + 110);
    textSize(50)
    text("Press Any Key To Play!!", width / 2 - 250, height / 2 + 200);
    pop();
}

function gameOver(){
    push();
    fill(255,0,0);
    noStroke();
    textSize(100);
    text("Game Over", width / 2 - 250, height / 2);
    textSize(30);
    text("Press 'R' to Play Again!", width / 2 - 150, height / 2 + 50);
    pop();
}

function reset(){

    game = true
    time = 60
    s = 0

    walls[0] = new Rect(width  - 300, height / 2, 40, 175, 7, {isStatic: true})
    walls[1] = new HoleWall(width - 10, height / 2, 50, 500)
    ball = new Ball(200, height / 2 + 100, 50);
    ss = new SlingShot(200, height / 2 + 100, ball.body)

}

function setup(){
    const canvas = createCanvas(windowWidth, windowHeight)
    engine = Engine.create()
    world = engine.world

    walls[0] = new Rect(width  - 300, height / 2, 40, 175, 7, {isStatic: true})
    walls[1] = new HoleWall(width - 10, height / 2, 50, 500)
    ball = new Ball(200, height / 2 + 100, 50);
    ss = new SlingShot(200, height / 2 + 100, ball.body)

    const mouse = Mouse.create(canvas.elt)
    mConstraint = MouseConstraint.create(engine, {mouse})

    World.add(world, mConstraint)

}

function draw(){
    background(100)

    if(start && !game)
        gameplay()
    else if(!start && game){
        Engine.update(engine)

        for(let i = 0; i < walls.length; i++)
            walls[i].update()

        ball.update()
        ss.update()

        timer()

        if(dist(ball.pos.x, ball.pos.y, mouseX, mouseY) < 2 * ball.r)
            dc = true
        else
            dc = false

        if(time == 0)
            game = false

    } else{
        gameOver()
        World.remove(world, [ball.body, walls[0].body, walls[1].compoundBody])
    }

    score()


}

function windowResized(){
    resizeCanvas(600,windowHeight-4)
}