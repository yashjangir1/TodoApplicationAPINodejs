const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dateFns = require("date-fns");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const formatResult = (result) => {
  return {
    id: result.id,
    todo: result.todo,
    priority: result.priority,
    status: result.status,
    category: result.category,
    dueDate: result.due_date,
  };
};

/*********************** API 1 *********************/

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let query1 = "";

  const statusPossibleValues = ["TO DO", "IN PROGRESS", "DONE"];
  const priorityPossibleValues = ["HIGH", "MEDIUM", "LOW"];
  const categoryPossibleValues = ["WORK", "HOME", "LEARNING"];

  if (
    status !== undefined &&
    priority !== undefined &&
    category !== undefined
  ) {
    if (!statusPossibleValues.includes(status)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (!priorityPossibleValues.includes(priority)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (!categoryPossibleValues.includes(category)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      query1 = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    status = '${status}' AND
                    priority = '${priority}' AND
                    category = '${category}' AND
                    todo LIKE "%${search_q}%";
                `;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else if (status !== undefined && priority !== undefined) {
    if (!statusPossibleValues.includes(status)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (!priorityPossibleValues.includes(priority)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      query1 = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    status = '${status}' AND
                    priority = '${priority}' AND
                    todo LIKE "%${search_q}%";`;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else if (status !== undefined && category !== undefined) {
    if (!statusPossibleValues.includes(status)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (!categoryPossibleValues.includes(category)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      query1 = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    status = '${status}' AND
                    category = '${category}' AND
                    todo LIKE "%${search_q}%";
                `;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else if (category !== undefined && priority !== undefined) {
    if (!priorityPossibleValues.includes(priority)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (!categoryPossibleValues.includes(category)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      query1 = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    category = '${category}' AND
                    priority = '${priority}' AND
                    todo LIKE "%${search_q}%";
                `;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else if (status !== undefined) {
    if (!statusPossibleValues.includes(status)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      query1 = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    status = '${status}' AND
                    todo LIKE "%${search_q}%";
                `;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else if (category !== undefined) {
    if (!categoryPossibleValues.includes(category)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      query1 = `
            SELECT 
                *
            FROM
                todo
            WHERE
                category = '${category}' AND
                todo LIKE "%${search_q}%";
            `;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else if (priority !== undefined) {
    if (!priorityPossibleValues.includes(priority)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      query1 = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    priority = '${priority}' AND
                    todo LIKE "%${search_q}%";
                `;
      const todoArr = await db.all(query1);
      response.send(todoArr.map((task) => formatResult(task)));
    }
  } else {
    query1 = `
        SELECT 
            *
        FROM
            todo
        WHERE
            todo LIKE "%${search_q}%";
        `;
    const todoArr = await db.all(query1);
    response.send(todoArr.map((task) => formatResult(task)));
  }
});

/***************** API 2 *****************/

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const query2 = `
      SELECT
         *
      FROM
        todo
      WHERE 
        todo.id = ${todoId};
    `;

  const task = await db.get(query2);
  response.send(formatResult(task));
});

/*********************** API 3 *************************/

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;

  let query3 = "";

  if (dateFns.isValid(dateFns.parse(date, "yyyy-M-d", new Date()))) {
    if (date !== undefined) {
      const formattedDate = dateFns.format(
        dateFns.parse(date, "yyyy-M-d", new Date()),
        "yyyy-MM-dd"
      );
      query3 = `
              SELECT 
                 *
              FROM 
                todo
              WHERE
                due_date = '${formattedDate}';
            `;
    } else {
      query3 = `
              SELECT 
                 *
              FROM 
                todo;
            `;
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }

  const agendaArr = await db.all(query3);
  response.send(agendaArr.map((agenda) => formatResult(agenda)));
});

/************************* API 4 ************************/

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const statusPossibleValues = ["TO DO", "IN PROGRESS", "DONE"];
  const priorityPossibleValues = ["HIGH", "MEDIUM", "LOW"];
  const categoryPossibleValues = ["WORK", "HOME", "LEARNING"];

  if (!statusPossibleValues.includes(status)) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (!priorityPossibleValues.includes(priority)) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (!categoryPossibleValues.includes(category)) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (
    !(
      dateFns.isMatch(dueDate, "yyyy-MM-dd") ||
      dateFns.isMatch(dueDate, "yyyy-M-d")
    )
  ) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const query4 = `
            INSERT INTO
              todo (id, todo, priority, status, category, due_date)
            VALUES(
              ${id},
              '${todo}',
              '${priority}',
              '${status}',
              '${category}',
              '${dateFns.format(new Date(dueDate), "yyyy-MM-dd")}'
              );
          `;
    await db.run(query4);
    response.send("Todo Successfully Added");
  }
});

/******************* API 5 ********************/

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, category, priority, todo, dueDate } = request.body;

  const statusPossibleValues = ["TO DO", "IN PROGRESS", "DONE"];
  const priorityPossibleValues = ["HIGH", "MEDIUM", "LOW"];
  const categoryPossibleValues = ["WORK", "HOME", "LEARNING"];

  if (status !== undefined) {
    if (!statusPossibleValues.includes(status)) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      const query5 = `
               UPDATE 
                  todo
               SET
                 status = "${status}"
               WHERE
                  id = ${todoId};
            `;

      await db.run(query5);
      response.send("Status Updated");
    }
  }

  if (priority !== undefined) {
    if (!priorityPossibleValues.includes(priority)) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      const query5 = `
               UPDATE 
                  todo
               SET
                 priority = "${priority}"
               WHERE
                  id = ${todoId};
            `;

      await db.run(query5);
      response.send("Priority Updated");
    }
  }

  if (category !== undefined) {
    if (!categoryPossibleValues.includes(category)) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      const query5 = `
               UPDATE 
                  todo
               SET
                 category = "${category}"
               WHERE
                  id = ${todoId};
            `;

      await db.run(query5);
      response.send("Category Updated");
    }
  }

  if (todo !== undefined) {
    const query5 = `
            UPDATE 
                todo
            SET
                todo = "${todo}"
            WHERE
                id = ${todoId};
        `;

    await db.run(query5);
    response.send("Todo Updated");
  }

  if (dueDate !== undefined) {
    if (
      dateFns.isMatch(dueDate, "yyyy-MM-dd") ||
      dateFns.isMatch(dueDate, "yyyy-M-d")
    ) {
      const query5 = `
            UPDATE 
                todo
            SET
                due_date = '${dateFns.format(new Date(dueDate), "yyyy-MM-dd")}'
            WHERE
                id = ${todoId};
        `;

      await db.run(query5);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

/******************* API 6 ********************/

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  const query6 = `
       DELETE FROM
        todo
       WHERE
         id = ${todoId};
    `;

  await db.run(query6);
  response.send("Todo Deleted");
});

module.exports = app;
