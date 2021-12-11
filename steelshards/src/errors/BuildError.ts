export class BuildError extends Error {

    constructor(
        msg: string,
        public sourceFile: string
    ) {
        super(msg);
    }

}
