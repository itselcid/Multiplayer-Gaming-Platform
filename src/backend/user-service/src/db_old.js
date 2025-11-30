import sqlite from 'sqlite3'
import bcrypt, { hash } from 'bcrypt'

const db = new sqlite.Database('usermgmt.db', (err) => {
    if (err) {
        console.error('Error opening database: ', err);
    } else {
        console.log("\x1b[32m%s\x1b[0m", 'Connected to database')
    }
})

// Create users table if it doesn't exist
function initDatabase() {
    const sql = `
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
        )
    `

    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table:', err)
        } else {
            console.log('Users table ready')
        }
    })
}

////// Temporary ///////

function createAdminIfNeeded() {
  getUserByUsername('admin', (err, user) => {
    if (!user) {
      createUser('admin', 'admin@example.com', 'admin', 'admin', (err, result) => {
        if (!err) {
          console.log("\x1b[32m%s\x1b[0m", 'Admin user created: username=admin, password=admin123')
        }
      })
    }
  })
}

function createTempUsers() {
  const tempUsers = [
    { username: 'test', email: 'test@test.com', password: 'test', role: 'user' },
    { username: 'one',  email: 'one@test.com',  password: '1111', role: 'user' },
    { username: 'two',  email: 'two@test.com',  password: '2222', role: 'user' }
  ];

  tempUsers.forEach(u => {
    getUserByUsername(u.username, (err, existing) => {
      if (!existing) {
        createUser(u.username, u.email, u.password, u.role, (err) => {
          if (!err) {
            console.log(`Temp user created: username=${u.username}, password=${u.password}`);
          }
        });
      }
    });
  });
}

////// Temporary ///////


function createUser(username, email, password, role, callback) {
    const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`

    const srounds = 8;

    bcrypt.hash(password, srounds, (err, hash) => {
        if (err) {
            callback(err, null)
            return
        }
        db.run(sql, [username, email, hash, role || 'user'], function (err) {
            if (err) {
                console.error('Error creating new user:', err)
                callback(err, null)
            } else {
                console.log("\x1b[32m%s\x1b[0m", 'new user added successfully')
                callback(null, {
                    id: this.lastID,
                    username,
                    email,
                    role: role || 'user'
                })
            }
        })
    })

}

function getUserByUsername(username, callback) {
  const sql = `SELECT id, username, email, password, role FROM users WHERE username = ?`
  
  db.get(sql, [username], (err, row) => {
    if (err) {
      callback(err, null)
    } else {
      callback(null, row)
    }
  })
}

function getAllUsers(callback) {
    const sql = `SELECT id, username, email FROM users`

    db.all(sql, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows)
        }
    })
}

function getUserById(id, callback) {
    const sql = `SELECT id, username, email FROM users WHERE id = ?`
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            callback(err, null)
        } else {
            callback(null, row)
        }
    })
}

// update and delete data

function updateUser(id, updates, callback) {

    const fields = []
    const values = []

    if (updates.email) {
        fields.push('email = ?')
        values.push(updates.email)
    }
    if (updates.role) {
        fields.push('role = ?')
        values.push(updates.role)
    }

    if (updates.password) {
        bcrypt.hash(updates.password, 8, (err, hash) => { // srounds = 8
            if (err) {
                callback(err, null)
                return
            }
            fields.push('password = ?')
            values.push(hash)
            executeUpdate()
        })
    } else {
        executeUpdate()
    }

    function executeUpdate() {
        if (fields.length === 0) {
            callback(new Error('No fields to update'), null)
            return
        }
    
        values.push(id)
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
        
        db.run(sql, values, function(err) {
            if (err) {
                callback(err, null)
            } else {
                callback(null, { updated: this.changes })
            }
        })
    }
}

function deleteUser(id, callback) {
    const sql = `DELETE FROM users WHERE id = ?`
    
    db.run(sql, [id], function(err) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, { deleted: this.changes }) // in case user not found this becomes empty
        }
    })
}


export {
    db,
    initDatabase,
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername ,
    updateUser,
    deleteUser,


    ///tmp
    createAdminIfNeeded,
    createTempUsers
}
