import "dotenv/config";
import connection from "../src/config/connectDB.js";

const levelCommission = [0.8, 0.6, 0.4, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

const update_bet_money_in_commission = async () => {
  try {
    const db = await connection;

    const [commissions] = await db.query(`SELECT * FROM commissions`);

    for (let i = 0; i < commissions.length; i++) {
      const commission = commissions[i];

      const levelFraction = levelCommission[commission.level - 1] / 100;

      const bet_money = commission.money / levelFraction;

      await db.query(
        `UPDATE commissions SET bet_money = ? WHERE commission_id = ?`,
        [bet_money, commission.commission_id],
      );
    }

    // db.query(sql, Object.values(user));

    console.log("Inserted Admin successfully!");
  } catch (error) {
    console.log(error);
    console.log("Failed to create user table!");
  }
};

update_bet_money_in_commission();
