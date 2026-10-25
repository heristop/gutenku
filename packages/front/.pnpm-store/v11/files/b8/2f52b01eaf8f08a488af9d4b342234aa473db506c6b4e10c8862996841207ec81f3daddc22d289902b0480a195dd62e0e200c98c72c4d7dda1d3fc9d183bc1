"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boundary = void 0;
class Boundary {
    constructor(source, endOffset, features) {
        this.source = source;
        this.endOffset = endOffset;
        this.features = features;
    }
    static *start(source, start, end, features) {
        features = { ...features, __combineToken: Symbol() };
        yield [``, source, start, features];
        return new Boundary(source, end, features);
    }
    end() {
        return [``, this.source, this.endOffset, this.features];
    }
}
exports.Boundary = Boundary;
//# sourceMappingURL=boundary.js.map