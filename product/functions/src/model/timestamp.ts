import { Timestamp } from "firebase-admin/firestore";

export class JsonTimestamp {
    seconds: number;
    nanoseconds: number;

    constructor(seconds: number, nanoseconds: number) {
        this.seconds = seconds;
        this.nanoseconds = nanoseconds;
    }

    toTimestamp(): Timestamp {
        return new Timestamp(this.seconds, this.nanoseconds);
    }
}