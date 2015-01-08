import express = require("express");

/*
*  Interface for managing web requests
*  @interface
**/
export interface IWebRequest {
  post(req: express.Request, res: express.Response);
  get(req: express.Request, res: express.Response);
}
