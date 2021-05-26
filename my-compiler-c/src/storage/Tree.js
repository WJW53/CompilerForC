export function makeNode(label, children, number) {
    this.label = label ? label : undefined;
    this.children = children ? children : undefined;
    this.number = number ? number : undefined;
}