var Generator = require('yeoman-generator'),
	_ = require('lodash'),
  exec = require('child_process').exec,
  glob = require('glob'),
  chalk = require('chalk');

function findDbFolder(database) {
  switch(database) {
    case 'MongoDB':
      return 'mongo-db';
    case 'Apache Cassandra':
      return 'cassandra-db';
    case 'PostgresSQL':
      return 'postgres-db';
    case 'MySQL':            
      return 'mysql-db';
    case 'MariaDB':            
      return 'maria-db';
    case 'MSSQL':            
      return 'mssql-db';
    case 'SQLite':            
      return 'sqlite-db';
  }
}

module.exports = class extends Generator {
  // note: arguments and options should be defined in the constructor.
  constructor(args, opts) {
    super(args, opts);
    // This makes `appname` not a required argument.
    this.argument('appname', { type: String, required: false, default: 'GOATstack' });

  }

  prompting() {
    return this.prompt([{
      type    : 'list',
      name    : 'apptype',
      message : 'Which app would you like to start with?',
      choices : [
        ` Demo Stack ${chalk.bold.yellow('(demo application found at www.goat-stack.herokuapp.com)')}`,
        ` HelloGOAT Stack ${chalk.bold.yellow('(basic fullstack without demo additions)')}`,
        ` DBlessGOAT Stack ${chalk.bold.yellow('(HelloGOAT without a database, client-side and express only)')}`,
        ` FireGOAT Stack ${chalk.bold.yellow('(DBlessGOAT with firebase as a "database as a service")')}`
      ],
      default : 0
    }, {
      type    : 'checkbox',
      name    : 'databases', 
      message : 'Select what databases you would like to use.',
      choices : ['MongoDB','Apache Cassandra', 'PostgresSQL', 'MySQL', 'MariaDB', 'SQLite', 'MSSQL'],
      when    : (res) => /^ HelloGOAT/.test(res.apptype)
    }, {
      type    : 'list',
      name    : 'defaultDb',
      message : 'What will be your default database?',
      choices : (res) => res.databases,
      when    : (res) => res.databases.length > 1
    }, {
      type    : 'input',
      name    : 'appname',
      message : 'Your new project\'s name?',
      default : this.options.appname
    }, {
      type    : 'input',
      name    : 'appdescription',
      message : 'Your new project\'s description?',
      default : 'The Greatest of All Time Stack!'
    }, {
      type    : 'input',
      name    : 'appkeywords',
      message : 'Your new project\'s keywords (comma between each word)?',
      default : 'redux, immutable, node, mongo, express, angular2, ng2, angular4, ng4, jasmine, karma, protractor, socketio, MEAN, webapp, Web Application'
    }, {
      type    : 'list',
      name    : 'protocol',
      message : 'What type of URL protocol would you like to use?',
      choices : ['http', 'https'],
      when    : (res) => !/^ DBlessGOAT/.test(res.apptype)
    }, {
      type    : 'confirm',
      name    : 'analyticschoice',
      message : 'Would you like to add Google Analytics?'
    }, {
      type    : 'editor',
      name    : 'analytics',
      message : 'Paste the Google Analytics script (including script tags) then save => exit!',
      when    : (res) => res.analyticschoice
    }]).then(function (answers) {
      this.databases = answers.databases; // initializing databases to scope
      // if defaultDb is defined then set the scope vaiable
      if (answers.defaultDb) this.defaultDb = findDbFolder(answers.defaultDb);
      // else only one database was selected, define as that
      else this.defaultDb = findDbFolder(this.databases[0]);
     
      this.dbFolders = [];

      for (let x = 0; x < this.databases.length; x++) {
        this.dbFolders.push(findDbFolder(this.databases[x]));
      }

      console.log(this.defaultDb);
      console.log(this.dbFolders);

      this.apptype          = /^ Demo/.test(answers.apptype) ? 'demo-app' : 
                              /^ HelloGOAT/.test(answers.apptype) ? 'starter-app' : 
                              /^ DBlessGOAT/.test(answers.apptype) ? 'dbless-app' : 'firebase-app';
    	this.appname          = answers.appname;
    	this.appdescription   = answers.appdescription;
    	this.appkeywords      = answers.appkeywords;

      this.analytics        = answers.analytics;
      this.protocol         = answers.protocol;

	    this.config.set({
        modules            : [
          'core',
          'home',
          'user-profile',
          '404',
          'shared',
        ],
        subModules          : {
          'core': [],
          'home': [],
          'user-profile': [],
          '404': [],
          'shared': []
        },

        newStoreImports     : [],
        newStoreAttrs       : [],
        newStoreReducers    : [],

        routerImports       : [],
        expressRouters      : [],
        socketImports       : [],
        socketRegisters     : [],

        apptype             : this.apptype,
        appname             : this.appname,
        appdescription      : this.appdescription,
        appkeywords         : this.appkeywords,
        protocol            : this.protocol === 'https',
        analytics           : this.analytics ? this.analytics.replace(/(\r\n|\n|\r)/gm, '') : '',
        defaultDb           : this.defaultDb,
        dbFolders           : this.dbFolders
	    });
	    this.config.save();

    }.bind(this));
  }

  // Writes the application to the name of the project
  writing() {
    // Write the application template
    this.fs.copyTpl(
      glob.sync(`${this.templatePath()}/${this.apptype}/**/**/**/*.!(svg|jpg|png|woff|woff2)`),
      this.destinationPath(),
      this.config.getAll()
    );

    // Copy over the application assets
    this.fs.copy(
      glob.sync(`${this.templatePath()}/${this.apptype}/public/*`),
      this.destinationPath('public')
    );    
  }

  // Starts npm install
  installYarn() {
    this.yarnInstall();
  }

  end() {
    if (this.protocol === 'https')
      exec('cd config/other && generate-ssl-certs.sh', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
      });
  }
}
