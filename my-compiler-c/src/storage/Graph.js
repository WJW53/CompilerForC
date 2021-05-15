//有向图的邻接表存储结构
class vex {          //存储顶点
    constructor(value) {
        this.data = value;
        this.firstEdge = null;
    }

}

class adjvex {       //链表节点
    constructor(node, weight) {
        this.node = node;
        this.weight = weight;
        this.next = null;
    }
}

class Graph {
    constructor(v, vr) {
        let len = v.length;
        let vexs = new Array(len);
        for (let i = 0; i < len; i++) {
            vexs[i] = new vex(v[i]);
        }
        for (let arc of vr) {
            let v1 = v.indexOf(arc[0]);//得到对应节点的索引
            let v2 = v.indexOf(arc[1]);
            let adj = vexs[v1].firstEdge;
            if (adj === null) {    //尾插法
                vexs[v1].firstEdge = new adjvex(v2, arc[2]);   //若为无向表，还需考虑vexs[v2]
            } else {
                while (adj.next !== null) {
                    if (adj.node === v2) {     //若重复定义同一条边，则覆盖权值
                        adj.weight = arc[2];
                        break;
                    }
                    adj = adj.next;
                }
                if (adj.node !== v2) {
                    adj.next = new adjvex(v2, arc[2]);
                }
            }
        }
        this.adjList = vexs;
    }
}

//第一个参数里: 为n个节点的编号
//第二个参数里: 分别是,第一个节点编号,所指向的节点编号,有向弧的权重
let a = new Graph([1, 2, 3, 4], [[1, 2, 10], [3, 4, 100], [2, 3, -16], [3, 1, 8]]);
console.log(a);


//用邻接表封装
function Graph_1() {
    //属性
    this.vertexes = [];  //顶点
    this.edges = new Dictionay(); //边
    //方法
    //1.添加顶点
    Graph_1.prototype.addVertex = function (v) {
        this.vertexes.push(v);
        this.edges.set(v, []);
    }
    //2.添加边
    Graph_1.prototype.addEdge = function (v1, v2) {
        this.edges.get(v1).push(v2);
        this.edges.get(v2).push(v1);//无向边
    }

    //3.toString方法
    Graph_1.prototype.toString = function () {
        var resultString = "";
        for (var i = 0; i < this.vertexes.length; i++) {
            resultSring += this.vertexes[i] + "->"
            var vEdges = this.edges.get(this.vertexes[i]);
            for (var j = 0; j < vEdges.length; j++) {
                resultString += vEdges[j] + ''
            }
            return resultString;
        }
    }
}
