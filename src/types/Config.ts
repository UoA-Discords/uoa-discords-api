export default interface Config {
    /** Port to listen on. */
    port: number;

    /** Discord bot token for verifying user IDs. */
    discordToken: string;

    /** MongoDB connection URI */
    mongoURI: string;
}
