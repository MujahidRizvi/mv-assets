import sequelize from './config/database';
import Logger from './config/logger';
import { app } from './app';
import contractService from './services/contract.service';

const start = async () => {
  await sequelize
    .sync({ alter: true })

    .then(() => {
      app.listen(process.env.APP_PORT, () => Logger.info(`Server is live at port:${process.env.APP_PORT}`));
    })
    .catch((err) => {
      Logger.error(err);
    });

  //Call the service to initiate contract listeners
  //await contractService.addContractListener();
};

start();
