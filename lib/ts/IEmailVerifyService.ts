export interface IEmailVerifyService {
	send(toEmail: string, token: string, callback: (err: Error) => void);
}
