const { R } = require("redbean-node");
const dayjs = require("dayjs");

class UptimeDuration {
    /**
     * Gets last heartbeat
     * @param {number} id ID of the monitor
     * @param {number} status Status of the heartbeat
     * @returns {Promise<Bean | null>} Heartbeat
     */
    static async lastHeartbeat(id, status) {
        return await R.getRow("SELECT * FROM heartbeat WHERE monitor_id = ? AND status = ? ORDER BY id DESC LIMIT 1", [
            id, status
        ]).catch(err => console.error(err));
    }

    /**
     * Get last uptime/downtime
     * @param {number} id ID of monitor
     * @param {number} status Status number
     * @returns {Promise<string>} Resulting string of uptime/downtime
     */
    static async getLastUptime(id, status) {
        const heartbeat = await this.lastHeartbeat(id, status);
        let duration = "N/A";
        if (heartbeat) {
            const previousTime = dayjs.utc(heartbeat.time);
            const diff = dayjs().utc().diff(previousTime, "s");

            duration = this.convertSecondsToUptimeString(diff);
        }
        return duration;
    }

    /**
     * Convert seconds to readable string
     * @param {number} seconds Number of seconds
     * @returns {string} Readable string
     */
    static convertSecondsToUptimeString(seconds) {
        const days = Math.floor(seconds / (24 * 3600));
        seconds %= 24 * 3600;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        let result = "";
        if (days) {
            result += `${days} days, `;
        }
        if (hours) {
            result += `${hours} hours, `;
        }
        if (minutes) {
            result += `${minutes} minutes, `;
        }
        result += `${seconds} seconds`;

        return result;
    }
}

module.exports = { UptimeDuration };
