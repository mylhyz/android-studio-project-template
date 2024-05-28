const fs = require("fs");
const path = require("path");

const cleanDir = (fp) => {
  if (fs.lstatSync(fp).isDirectory()) {
    const files = fs.readdirSync(fp);
    if (files.length == 0) {
      //可以清理，继续向上查找
      console.log("cleaning", fp);
      fs.rmdirSync(fp);
      cleanDir(path.join(fp, ".."));
    }
  }
};

const fixSettingsGradleKts = (name) => {
  const fp = path.join(__dirname, "../settings.gradle.kts");
  const contents = fs.readFileSync(fp, {
    encoding: "utf-8",
  });
  const lines = contents.split("\n");
  const newLines = [];
  for (let line of lines) {
    if (line.indexOf("AndroidStudioProjectTemplate") !== -1) {
      line = line.replaceAll("AndroidStudioProjectTemplate", name);
    }
    newLines.push(line);
  }
  const newContents = newLines.join("\n");
  fs.writeFileSync(fp, newContents, { encoding: "utf-8" });
};

const fixAppBuildGradleKts = (pkg) => {
  const fp = path.join(__dirname, "../app/build.gradle.kts");
  const contents = fs.readFileSync(fp, {
    encoding: "utf-8",
  });
  const lines = contents.split("\n");
  const newLines = [];
  for (let line of lines) {
    if (line.indexOf('namespace = "io.viper.android.template.app"') !== -1) {
      line = line.replaceAll("io.viper.android.template.app", pkg);
    } else if (
      line.indexOf('applicationId = "io.viper.android.template.app"') !== -1
    ) {
      line = line.replaceAll("io.viper.android.template.app", pkg);
    }
    newLines.push(line);
  }
  const newContents = newLines.join("\n");
  fs.writeFileSync(fp, newContents, { encoding: "utf-8" });
};

const fixPackageName = (fp, pkg) => {
  const contents = fs.readFileSync(fp, {
    encoding: "utf-8",
  });
  const lines = contents.split("\n");
  const newLines = [];
  for (let line of lines) {
    if (line.indexOf("package io.viper.android.template.app") !== -1) {
      line = line.replaceAll("io.viper.android.template.app", pkg);
    }
    newLines.push(line);
  }
  const newContents = newLines.join("\n");
  fs.writeFileSync(fp, newContents, { encoding: "utf-8" });
};

const FixPackageName = (pkg) => {
  const list = [
    "../app/src/androidTest/java/io/viper/android/template/app/ExampleInstrumentedTest.kt",
    "../app/src/main/java/io/viper/android/template/app/MainActivity.kt",
    "../app/src/test/java/io/viper/android/template/app/ExampleUnitTest.kt",
  ];
  for (let item of list) {
    const fp = path.join(__dirname, item);
    if (!fs.existsSync(fp)) {
      console.log("[FixPackageName]", `ignored. not exists ${fp}`);
      continue;
    }
    fixPackageName(fp, pkg);
  }
};

const fixProjectName = (fp, name) => {
  const contents = fs.readFileSync(fp, {
    encoding: "utf-8",
  });
  const lines = contents.split("\n");
  const newLines = [];
  for (let line of lines) {
    if (line.indexOf("AndroidStudioProjectTemplate") !== -1) {
      line = line.replaceAll("AndroidStudioProjectTemplate", name);
    }
    newLines.push(line);
  }
  const newContents = newLines.join("\n");
  fs.writeFileSync(fp, newContents, { encoding: "utf-8" });
};

const FixProjectName = (name) => {
  const list = [
    "../app/src/main/AndroidManifest.xml",
    "../app/src/main/res/values-night/themes.xml",
    "../app/src/main/res/values/themes.xml",
    "../app/src/main/res/values/strings.xml",
  ];
  for (let item of list) {
    const fp = path.join(__dirname, item);
    fixProjectName(fp, name);
  }
};

const FixPackage = (pkg) => {
  const list = [
    "../app/src/main/java/io/viper/android/template/app",
    "../app/src/test/java/io/viper/android/template/app",
    "../app/src/androidTest/java/io/viper/android/template/app",
  ];
  const pkgPath = pkg.replaceAll(".", "/");
  const pattern = "io/viper/android/template/app";
  for (let item of list) {
    const fp = path.join(__dirname, item);
    if (!fs.existsSync(fp)) {
      console.log("[FixPackage]", `ignored. not exists ${fp}`);
      continue;
    }
    const newFp = path.join(__dirname, item.replace(pattern, pkgPath));
    if (!fs.existsSync(newFp)) {
      fs.mkdirSync(newFp, { recursive: true });
    }
    fs.renameSync(fp, newFp);
    // 改名之后原目录会保留到 app/src/test/java/io/viper/android/template/ 就是没有最后的app了
    cleanDir(path.join(fp, ".."));
  }
};

const runMain = async () => {
  // 读取配置文件
  const app_conf = require("./app.json");
  // 使用配置文件修改内容
  fixSettingsGradleKts(app_conf.name);
  fixAppBuildGradleKts(app_conf.package);
  FixPackageName(app_conf.package);
  FixProjectName(app_conf.name);
  FixPackage(app_conf.package);
};

runMain();
