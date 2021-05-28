export function makeNode(label, children, number, row) {
    this.label = label ? label : undefined;
    this.children = children ? children : undefined;
    this.number = number ? number : undefined;
    this.row = row ? row : undefined;
}