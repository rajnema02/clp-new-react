const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const ExamReportModel = require("./../Models/ExamReport.model");
const mongoose = require("mongoose");
const BatchModel = require("./../Models/Batch.model");
const StudentModel = require("./../Models/User.model");
const ExamModel = require("./../Models/Exam.model");
const zlib = require("zlib");
const archiver = require("archiver");
const multer = require("multer");
const upload = multer({
  dest: path.join(__dirname, "./../certificates/signed-certificates"),
});
// const newPath = require('')

module.exports = {
  downloadPDF2: async (req, res, next) => {
    try {
      const { exam_id } = req.query;

      const examReport = await ExamReportModel.find({
        Exam_id: mongoose.Types.ObjectId(exam_id),
      });
    //   console.log(examReport);

      const examData = await ExamModel.findOne({
        _id: mongoose.Types.ObjectId(exam_id),
      });

      const batchId = examData.batch_id[0];
      var thirdAttemptExam = false;
      const batchData = await BatchModel.findOne({
        _id: mongoose.Types.ObjectId(batchId),
      });

      if (examData.parent_exam) {
        const parentExamData = await ExamModel.findOne({
          _id: mongoose.Types.ObjectId(examData.parent_exam),
        });
        if (parentExamData.parent_exam) {
          thirdAttemptExam = true;
        }
      }

      const dir = path.join(
        __dirname,
        `./../certificates/unsigned-certificates/unsigned-${exam_id}`
      );
    //   console.log(dir);
      //   const newDir = './new-dir';
      if (!fs.existsSync(dir)) {
        console.log("making folder", fs.existsSync(dir));
        fs.mkdir(dir, (e) => {
          if (e) {
            console.error(e);
          } else {
            console.log("Success");
          }
        });
      }

      for (let exam of examReport) {
        console.log("Attampt",thirdAttemptExam);
        if (exam.Result == "Pass") {
          console.log("******************************************Pass Status",exam.Result );
          console.log("exam.Student_name",exam.Student_name);
          console.log("exam.Student_grade",exam.grade);
          const studentDetail = await StudentModel.findOne({
            _id: mongoose.Types.ObjectId(exam.Student_id),
          });
          const sampleCertificatePath = path.join(
            __dirname,
            "./../templates/certificate.html"
          );
          const unsignedCertificatePath = path.join(
            __dirname,
            `./../certificates/unsigned-certificates/unsigned-${exam_id}/${exam_id}-${exam.Student_id}.html`
          );

          fs.readFile(sampleCertificatePath, (err, data) => {
            if (err) {
              // Handle error
              res.status(500).send(`Error loading index.html: ${err}`);
              return;
            }

            data = data.toString("utf8");
            data = data.replace("{{full_name}}", exam.Student_name);
            data = data.replace("{{father_name}}", studentDetail?.father_name ? studentDetail?.father_name:'');
            data = data.replace("{{course_type}}", batchData.course_type);
            data = data.replace("{{course_name}}", batchData.course_name);
            data = data.replace("{{from_date}}", batchData.startDate);
            data = data.replace("{{to_date}}", batchData.endDate);
            data = data.replace("{{grade}}", exam.grade);
            data = data.replace("{{referenceNo}}", exam.Student_id);
            fs.writeFileSync(unsignedCertificatePath, data);
          });
          const browser = await puppeteer.launch({ headless: "new" });

          // Create a new page
          const page = await browser.newPage();
          // await page.waitForSelector('img');

          //Get HTML content from HTML file
          const html = fs.readFileSync(unsignedCertificatePath, "utf-8");
          await page.setContent(html, { waitUntil: "domcontentloaded" });

          // To reflect CSS used for screens instead of print
          await page.emulateMediaType("screen");
          await page.setViewport({
            width: 1366,
            height: 1080,
            deviceScaleFactor: 1,
            isLandscape: true,
          });
          const newName = `${exam_id}-${exam.Student_id}.pdf`;

          // Downlaod the PDF
          const pdf = await page.pdf({
            path:
              path.join(
                __dirname,
                `./../certificates/unsigned-certificates/unsigned-${exam_id}/`
              ) + newName,
            isLandscape: true,
            printBackground: false,
            format: "A4",
            waitUntil: "networkidle0",
          });

          await browser.close();

          fs.unlink(unsignedCertificatePath, (err) => {
            if (err) {
              console.error("An error occurred while deleting the file:", err);
            } else {
              console.log("File has been deleted successfully.");
            }
          });
        }
        
        if (thirdAttemptExam) {
            console.log ("123")
          if (exam.Result == "Fail") {
          console.log ("123456")
            const studentDetail = await StudentModel.findOne({
              _id: mongoose.Types.ObjectId(exam.Student_id),
            });
            if (studentDetail){

          
            console.log("student details ==>",studentDetail)
            const sampleCertificatePath = path.join(
              __dirname,
              "./../templates/participationCertificate.html"
            );
            const unsignedCertificatePath = path.join(
              __dirname,
              `./../certificates/unsigned-certificates/unsigned-${exam_id}/${exam_id}-${exam.Student_id}.html`
            );

            fs.readFile(sampleCertificatePath, (err, data) => {
              if (err) {
                // Handle error
                res.status(500).send(`Error loading index.html: ${err}`);
                return;
              }

              data = data.toString("utf8");
              data = data.replace("{{full_name}}", exam.Student_name);
              data = data.replace("{{father_name}}", studentDetail.father_name || '' );
              data = data.replace("{{course_type}}", batchData.course_type);
              data = data.replace("{{course_name}}", batchData.course_name);
              data = data.replace("{{from_date}}", batchData.startDate);
              data = data.replace("{{to_date}}", batchData.endDate);
              data = data.replace("{{referenceNo}}", exam.Student_id);
              fs.writeFileSync(unsignedCertificatePath, data);
            });
            const browser = await puppeteer.launch({headless: "new",});

            // Create a new page
            const page = await browser.newPage();

            //Get HTML content from HTML file
            const html = fs.readFileSync(unsignedCertificatePath, "utf-8");
            await page.setContent(html, { waitUntil: "domcontentloaded" });

            // To reflect CSS used for screens instead of print
            await page.emulateMediaType("screen");

            const newName = `${exam_id}-${exam.Student_id}.pdf`;
            console.log("new name pdf created ==>" , newName)

            // Downlaod the PDF
            const pdf = await page.pdf({
              path:
                path.join(
                  __dirname,
                  `./../certificates/unsigned-certificates/unsigned-${exam_id}/`
                ) + newName,

              printBackground: true,
              format: "A4",
              waitUntil: "networkidle0",
            });

            await browser.close();
            fs.unlink(unsignedCertificatePath, (err) => {
              if (err) {
                console.error(
                  "An error occurred while deleting the file:",
                  err
                );
              } else {
                console.log("File has been deleted successfully.");
              }
            });
          }else{
            const studentDetail = await StudentModel.findOne({
              _id: mongoose.Types.ObjectId(exam.Student_id),
            });
            if (studentDetail){
            const sampleCertificatePath = path.join(
              __dirname,
              "./../templates/certificate.html"
            );
            const unsignedCertificatePath = path.join(
              __dirname,
              `./../certificates/unsigned-certificates/unsigned-${exam_id}/${exam_id}-${exam.Student_id}.html`
            );

            fs.readFile(sampleCertificatePath, (err, data) => {
              if (err) {
                // Handle error
                res.status(500).send(`Error loading index.html: ${err}`);
                return;
              }

              data = data.toString("utf8");
              data = data.replace("{{full_name}}", exam.Student_name);
              data = data.replace("{{father_name}}", studentDetail?.father_name ? studentDetail?.father_name:'' );
              data = data.replace("{{course_type}}", batchData.course_type);
              data = data.replace("{{course_name}}", batchData.course_name);
              data = data.replace("{{from_date}}", batchData.startDate);
              data = data.replace("{{to_date}}", batchData.endDate);
              data = data.replace("{{grade}}", exam.grade);
            data = data.replace("{{referenceNo}}", exam.Student_id);
              fs.writeFileSync(unsignedCertificatePath, data);
            });
            const browser = await puppeteer.launch({headless: "new",});

            // Create a new page
            const page = await browser.newPage();

            //Get HTML content from HTML file
            const html = fs.readFileSync(unsignedCertificatePath, "utf-8");
            await page.setContent(html, { waitUntil: "domcontentloaded" });

            // To reflect CSS used for screens instead of print
            await page.emulateMediaType("screen");

            const newName = `${exam_id}-${exam.Student_id}.pdf`;

            // Downlaod the PDF
            const pdf = await page.pdf({
              path:
                path.join(
                  __dirname,
                  `./../certificates/unsigned-certificates/unsigned-${exam_id}/`
                ) + newName,

                isLandscape: true,
                printBackground: false,
                format: "A4",
                waitUntil: "networkidle0",
            });

            await browser.close();
            fs.unlink(unsignedCertificatePath, (err) => {
              if (err) {
                console.error(
                  "An error occurred while deleting the file:",
                  err
                );
              } else {
                console.log("File has been deleted successfully.");
              }
            });
          }
          }
          }
        }
      }
      //====== Zipping the cerificate genrated Start==========
      console.log("<<<<<<<<<<<<<<<<<<<<<<Zipping Started");
      const inputFilePath = path.join(
        __dirname,
        `./../certificates/unsigned-certificates/unsigned-${exam_id}`
      );
      const outputFilePath = path.join(
        __dirname,
        `./../certificates/unsigned-certificates/unsigned-${exam_id}.zip`
      );
      const output = fs.createWriteStream(outputFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        console.log("Folder has been zipped successfully.");
      });

      output.on("end", () => {
        console.log("Data has been drained");
      });

      archive.on("warning", (err) => {
        if (err.code === "ENOENT") {
          console.warn("<<=====Archive warning====>>", err);
        } else {
          throw err;
        }
      });

      archive.on("error", (err) => {
        throw err;
      });

      archive.pipe(output);
      archive.directory(inputFilePath, false);
      archive.finalize();

      res.send({ filePath: outputFilePath });
      return;
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Error generating PDF" });
    }
  },

  downloadCertificates: async (req, res, next) => {
    try {
      const { exam_id } = req.query;
      console.log("Download Cerificate exam id", exam_id);
      const filename = `unsigned-${exam_id}.zip`;
      console.log("Expected filename",filename);
      const directory = path.join(
        __dirname,
        `./../certificates/unsigned-certificates/`
      );
      // Read the contents of the directory
      fs.readdir(directory, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return;
        }

        // Check each file in the directory
        for (const file of files) {
          const filePath = path.join(directory, file);
          console.log(filePath);
          console.log("file iterating>>>>>>>>>>>",file);
          if (file === filename) {
            console.log("File found:", filePath);
            res.sendFile(filePath);
            return;
          }

          // Check if the current file is a directory
          //   if (fs.statSync(filePath).isDirectory()) {
          // Recursively search the subdirectory
          //     searchFile(filePath, filename);
          //   } else {
          // Check if the current file matches the desired filename

          //   }
        }

        res.send({ message: "Certificates not generated yet!" });
        return;
      });
    } catch (error) {
      next(error);
    }
  },
  checkIfAlreadyGenerated: async (req, res, next) => {
    try {
      const { examId } = req.query;
      const filename = `unsigned-${examId}`;
      console.log("Concatenated", filename);
      const directory = path.join(
        __dirname,
        `./../certificates/unsigned-certificates/`
      );
      const files = fs.readdirSync(directory);
      console.log(files);
      for (file of files) {
        console.log('looping');
        if (file == filename) {
          res.json({
            success: true,
            message: "Certificates already generated",
          });
          return;
          // } else {
          //   res.json({
          //     success: false,
          //     message: "Certificates not already downloaded",
          //   });
          //   return;
          // }
        }
      }
      res.json({ success: false, message: "no certificates generated yet!!" });
      return;

      // Check each file in the directory
    } catch (error) {
      next(error);
    }
  },

  checkIfAlreadyDownloaded: async (req, res, next) => {
    try {
      const { examId } = req.query;
      const filename = `signed-${examId}`;
      console.log("Concatenated", filename);
      const directory = path.join(
        __dirname,
        `./../certificates/signed-certificates/`
      );
      const files = fs.readdirSync(directory);
      console.log(files);
      for (file of files) {
        console.log('looping');
        if (file == filename) {
          res.json({
            success: true,
            message: "Certificates already downloaded",
          });
          return;
          // } else {
          //   res.json({
          //     success: false,
          //     message: "Certificates not already downloaded",
          //   });
          //   return;
          // }
        }
      }
      res.json({ success: false, message: "no certificates downloaded yet!!" });
      return;

      // Check each file in the directory
    } catch (error) {
      next(error);
    }
  },
  uploadCertificates: async (req, res, next) => {
    try {
      upload.array("files"),
        (req, res, err) => {
          if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
          }
          const uploadedFiles = req.files;

          // Process and save the files
          for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const originalName = file.originalname;
            const filePath = file.path;

            // Save the file to your desired location or perform further processing
            // For example, you can move the file to a different directory or save its metadata to a database
            // ...

            console.log(`File ${originalName} saved to ${filePath}`);
          }

          return res.json({ message: "Files uploaded successfully" });
        };
    } catch (error) {
      next(error);
    }
  },
};
