class StagingDirection {
    constructor(
        public startTime: number,
        public endTime: number,
        public enabled: boolean
    ) {}
}

class ActingDirection {
    constructor(
        public startTime: number,
        public endTime: number,
        public enabled: boolean,
        public startPosition: { x: number, y: number, z: number },
        public endPosition: { x: number, y: number, z: number },
        public anim: string
    ) {}
}

class Model {
    private stagingDirections: StagingDirection[];
    private actingDirections: ActingDirection[];

    constructor() {
        this.stagingDirections = [
            new StagingDirection(0, 1, false),
            new StagingDirection(1, 9, true),
            new StagingDirection(9, 10, false)
        ];

        this.actingDirections = [
            new ActingDirection(0, 2, false, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, ''),
            new ActingDirection(2, 3, true, { x: -5, y: 0, z: 0 }, { x: -5, y: 0, z: 0 }, 'idle'),
            new ActingDirection(3, 7, true, { x: -5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, 'walk'),
            new ActingDirection(7, 8, true, { x: 5, y: 0, z: 0 }, { x: 5, y: 0, z: 0 }, 'idle'),
            new ActingDirection(8, 10, false, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, '')
        ];
    }

    queryAtTime(t: number) {
        // Determine staging state
        const activeStagingDirection = this.stagingDirections.find(direction => direction.startTime <= t && t < direction.endTime);
        const stagingState = activeStagingDirection ? activeStagingDirection.enabled : false;

        // Determine acting state
        const activeActingDirection = this.actingDirections.find(direction => direction.startTime <= t && t < direction.endTime && direction.enabled);
        let actingState = { enabled: false, position: { x: 0, y: 0, z: 0 }, anim: '' };
        if (activeActingDirection) {
            const { startPosition, endPosition, anim } = activeActingDirection;
            const progress = (t - activeActingDirection.startTime) / (activeActingDirection.endTime - activeActingDirection.startTime);
            const position = {
                x: startPosition.x + (endPosition.x - startPosition.x) * progress,
                y: startPosition.y + (endPosition.y - startPosition.y) * progress,
                z: startPosition.z + (endPosition.z - startPosition.z) * progress
            };
            actingState = { enabled: true, position, anim };
        }

        // Determine staging sequence
        const stagingSequence = this.stagingDirections
            .filter(direction => t < direction.endTime)
            .map(direction => {
                if (direction.startTime <= t) {
                    return new StagingDirection(t, direction.endTime, direction.enabled);
                }
                return direction;
            });

        // Determine acting sequence
        const actingSequence = this.actingDirections
            .filter(direction => t < direction.endTime)
            .map(direction => {
                if (direction.startTime <= t) {
                    return new ActingDirection(t, direction.endTime, direction.enabled, direction.startPosition, direction.endPosition, direction.anim);
                }
                return direction;
            });

        return { stagingState, actingState, stagingSequence, actingSequence };
    }
}

export { Model, StagingDirection, ActingDirection };