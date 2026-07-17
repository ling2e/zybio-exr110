# POCT-EXR110 Series-Manuals-EXR110 LIS Protocol.pdf

EXR100 Series Fluorescence Immunochromatography Analyzer

LIS Transfer Protocol

Prepared by Software development

engineer RD1213 Date

Reviewed by

Function Date

Function Date

Function Date

Approved by Function Date

Document Revision History

Version Revision history Prepared

01 Initial release RD1213 January 4, 2023

1. Update the information on channel number for uploading

and downloading;

2. Update the Table of Communication Parameter Unit.

RD385 March 9, 2023

1. Introduction to LIS Protocol ................................................................................................................................ 13

2. Protocol Definition ...............................................................................................................................................13

3. Definition of Message Segment ...........................................................................................................................17

4. Appendix: Definition of Message Code .............................................................................................................. 22

1. Introduction to LIS Protocol

## Overview

Zybio LIS interface protocol is based on HL7 v2.3.1. The protocol supports bidirectional transmission between EXR100 series and LIS system, i.e., the test results can be uploaded to the LIS system and the sample information can be downloaded from the LIS system to the instrument.

## Models applicable to the protocol

Q8PRO, Q20, EXR100 series manufactured by Zybio, including models Q8Pro, Q20, EXR100, EXR110, EXR120

2. Protocol Definition

## Protocol transfer process

A persistent connection is established between the instrument and the LIS system via the TCP/IP protocol to transmit messages. The entire transmission process is divided into 3 phases, i.e. connection establishment, data communication and disconnection. 1) Connection establishment When the instrument is turned on, it will attempt to actively connect to the LIS server based on the instrument configuration (server IP and port). If the connection is successful, the connection process will end. If the connection is unsuccessful, it will attempt to reconnect after an interval. 2) Data communication Once the connection has been established, the instrument will report a message to the LIS system after counting or editing, or in scenarios where the user chooses to upload, etc. 3) Disconnection The instrument will actively disconnect from the LIS system before the instrument is normally turned off. Restarting the port in Settings also makes instrument actively disconnect from LIS system and attempt to reconnect.

## HL7 underlying protocol

Due to the fact that TCP/IP used is a byte stream protocol, message boundaries should be provided if message confusion needs to be avoided. The HL7 protocol only defines the format of upper-level business messages and does not provide message boundaries. To acknowledge message boundaries. At the communication layer, messages are transmitted in the following format: Messages are transmitted in the following format:

<SB> ddddd <EB> <CR> Where:

<SB> = Start Block character (1 byte)

ASCII <VT>, i.e.<0x0B> should not be confused with the characters SOH or STX in ASCII. ddddd = Data (variable number of bytes) ddddd is an HL7 message that includes only ISO 8859-1 characters (hexadecimal values 20-FF) and <CR>,

excluding other control and characters that cannot be printed. <EB> = End Block character (1 byte) ASCII<FS>, i.e. <0x1C> should not be confused with the characters ETX or EOT in ASCII. <CR> = Carriage Return (1 byte) ASCII carriage return character, i.e. <0x0D>.

## HL7 Upper-level message protocol

The sample results and other data information are communicated in UTF-8 encoded strings. Message strings are represented according to HL7 standards, that is, a message contains multiple segments, each of which may be divided into multiple fields, each of which may be divided into multiple components, each of which may be divided into multiple sub-components. Segments, fields, components, sub-components are divided by delimiters. Sample message examples are as follows:

MSH|^~\&|Q3|Zybio|||20220104192722||ORU^R01|202201041927229109|P|2.3.1||||||UNICODE

SFT|Zybio|1.1|EXR100|q20-gc14||

PID|1||binlihao^^^^MR||xingmin^|||M|N

PV1|1|huanzheleixin|keshi^^chuanghao|zhuyuanhao||||||||||||||||

OBR|3008||44rr|01001^Automated

Count^99MRC||20211223165200|20211223165240|||songjianzhe|||zhenduan|20211223165200|PLASMA|jianyanz

he||||||||HM||||||||

OBX|1|IS|03001^Take Mode^99MRC||O||||||F

OBX|2|NM|31525-0^Age^LN||12|yr|||||F

OBX|3|IS|09001^Remark^99MRC||beizhu||||||F

OBX|4|IS|03004^Sys Seq^99MRC||3008||||||F

OBX|5|IS|03005^Worklist Seq^99MRC||-1||||||F

OBX|6|NM|6806-1^SAA^LN||125.00|μg/mL|<10|A~H|6806||F

#### QC message examples are as follows:

MSH|^~\&|Q3|Zybio|||20200731150629||ORU^R01|202007311506294157|Q|2.3.1||||2||UNICODE

OBR|1|QC solution 1|123456|02001^QCR^99MRC||20200731||||||||||||||||||HM||||||||

OBX|1|NM|6802-1^cTnT^LN|5^0.5|<0.01|ng/mL|<0.04ng/mL|N|6802||F

OBX|2|NM|6802-2^CK-MB^LN|10^1|11.83|ng/mL|<5ng/mL|A~H|6802||F

OBX|3|NM|6802-3^Myo^LN|80^5|<5|ng/mL|<72ng/mL|N|6802||F

## Basic grammar of HL7

Each HL7 message consists of a number of segments terminated by <CR> (i.e. <0x0D>). Messages are transmitted in utf-8 format Each segment consists of a three-character segment name and a fixed number of domains. The domain consists of components and sub-components, and the separator for each constituent unit is defined in the MSH segment of each message. For example:

MSH|^~&|Q3|Zybio|||20190905145944||ORU^R01|201909051459444942|P|2.3.1||||||UNICODE Where: The five characters following MSH define the separator used to distinguish between domains, components, and sub-components. The HL7 standard uses the characters in the following table:

| Domain separator ^ Component separator & Subcomponent separator ~ Repetition separator \ Escape character

The first domain of MSH includes various separators. Some of the following domains are empty because they are optional and not used by the HL7 interface, and the detailed domain definition and selection will be described later.

Domain 9: Contains message types and events (ORU, R01) Domain 10: Contains a message ID that uniquely identifies the message Domain 11: Contains the processing ID (P for product) Domain 12: Define the HL7 version used for messages (2.3.1)

For any kind of message, the order of the segments following the MSH segment is specified. These orders will be described specifically in the following sections. These syntactic structures are used to indicate that the segments are optional or repeated:

\[ \] indicates that the segment inside is optional. { } indicates that each segment inside can be repeated 0, 1 or more times.

If the separators defined above appear in the string data such as diagnostic information, user-defined gender, etc., the separator in the original string needs to be escaped to a sequence of escape characters and restored during decoding.

Sequence of Escape Character Original Character

\R\ Repetition separator

## Duplex communication

Duplex communication includes the transmission of sample test results and work order query. The transmission of sample test results mainly realizes the transmission of the sample test results from the instrument side to the LIS server. The data transmission methods include real-time transmission and batch transmission of historical data. The analyzer supports batch transfer of historical data during sample analysis. The work order query is implemented for the instrument to query the LIS server for sample pre-filling information such as blood sample mode, analysis mode, etc. The work order query can be achieved through the sample barcodes or the position of the test tubes for the samples. Schematic diagram of obtaining sample information from the LIS server:

QRY/Q02: Query of observation results/delayed responses QRY/Q02: Message type. Q02 is an immediate delay event. The message structure is as follows:

Name Required or Not

Application A

Repetition or Not

Applicat ion B

Repetition or Not

MSH Message Header R QRD Query Definition R QRF Query Filter DSC Continuation Pointer

#### The DSR message structure is as follows:

\S\ Component separator

\T\ Subcomponent separator

\F\ Field separator

\E\ Escape separator

\.br\ <CR> is the message segment terminator.

Name Required or Not

Application A

Repetition or Not

Applicat ion B

Repetition or Not

MSH Message Header R MSA Message

Acknowledgment R

ERR Error QRD Query Definition R QRF Query Filter DSP Display Data DSC Continuation Pointer

Event type: Value Description Applicat

ion A Application B

Q01 QRY/DSR - Query sent for immediate response Immedia te response

Q02 QRY/QCK - Query sent for deferred response Delayed response

Q03 DSR/ACK - Deferred response to a query Q05 UDM/ACK - Unsolicited display update message

3. Definition of Message Segment

The MSH (Message Header) segment contains basic information of the HL7 message, including the value of the message separator, the message type, the message encoding style, etc., and is the 1st field of each HL7 message. Message example:

MSH|^~&|Q3|Zybio|||20190905145944||ORU^R01|201909051459444942|P|2.3.1||||||UNICODE The fields used by the MSH segments are defined in Table 1. Field No. Name Type Length

Limit (< =) Meaning Example

1 Field Seperator ST 1 It contains the 1st field separator following the name of the message segment, and is used to specify the value of the field separator for the rest of the message.

2 Encoding Characters ST 4 It contains component separators, repetition separators, escape separators and subcomponent separators.

3 Sending Application EI 180 Application on the sending side. If the message is sent by the host, the value is taken as “Q3”.

4 Sending Facility EI 180 Device on the sending side. The value is taken as “Zybio”.

7 Date/Time Of Message TS 26 Message creation time (in the form of YYYY\[MM\[DD\[HH\[MM\[SS\]\]\]\]\]), the system time value is taken.

201909051 45944

9 Message Type C M

7 Message type, in the form of “message type^event type”.

10 Message Control ID ST 20 Message control ID, used to uniquely identify a message.

11 Processing ID PT 3 Message processing ID. The values include: “P”: Sample information “Q”: Information on quality control results.

12 Version ID VI D

60 HL7 version number, the value is taken as “2.3.1”.

#### Description of the 9th field in MSH:

Value Meaning Remarks

ORU^R01 Upload counting results and QC results Q for the 11th field in MSH in case of QC results

ACK^R01 Acknowledge the received ORU^R01 message.

Description of ACKAcknowledgment

MSH message header

MSA message acknowledgment, describing whether the communication message was successfully received

MSA - message acknowledgment segment

Field No. Name Length Meaning

1 Acknowledgment Code 2 Acknowledgement code, AA for acceptance;

AE for error; AR for rejection

2 Message Control ID 20 Message control ID, same as the sender’s MSH-10

3 Text Message 80 Text message, a text description of the event in case of error or rejection. Corresponding to the 6th field.

It can be used to write error logs

4 Expected Sequence Number 15 Blank, reserved. Expected serial number

5 Delayed Acknowledgment Type

1 Blank, reserved. Type of delayed acknowledgement

6 Error Condition 100 Error conditions (status code)

10 Message Control ID ST 20

11 Processing ID

12 Version ID VID 60

#### Values for MSA-6 fields are given in the following table:

Status Code Status Text (MSA-3) Description/Remarks

Success Status Code: AA

0 Message accepted Successful

Error Status Code: AE

100 Segment sequence error Segment sequence is incorrect or a required segment is missing

101 Required field missing A required field is missing in a segment

102 Data type error Data type error of a field, such as a number becoming a character

103 Table value not found Table value not found

Reject Status Code: AR

200 Unsupported message type Message type not supported

201 Unsupported event code Event code not supported

202 Unsupported processing id Processing ID not supported

203 Unsupported version id Version ID not supported

204 Unknown key identifier Unknown key identifier, such as transmitting a patient information that does not exist

205 Duplicate key identifier Duplicate key identifier already exists

206 Application record locked Transaction cannot be executed at the application memory level, such as databases being locked

207 Application internal error Unknown other application internal errors

#### Software Segment paragraph contains software information. Message example:

SFT|Zybio|1.0|Q3|||

Field No. Name Type Length Meaning Example 1 Software Vendor

Organization XON 20 Software name Zybio

2 Software Certified Version or

Release Number

ST 12 Software version number

3 Software Product Name

ST 20 Software name Q3

4 Software Binary ID

ST 20 Serial number of the instrument

5 Software Product

Information

TX 512 Software description

6 Software Install Date

DTM 24 Software installation date

The PID (Patient Identification) segment contains the patient’s basic information. Message example:

PID|1||BN20190315002^^^^MR||Wang XX^||20001015|1|1

Name Type Lengt h

Meaning Example

1 Set ID-PID SI 4 Serial number, used to identify the different PID segments in a message.

3 Patient Identifier List

Used as a medical record number in the sample test result message, in the form of “Medical Record Number^^^^MR”.

BN20190315002^^^^MR

5 Patient Name

Patient name Wang XX

7 Date/Time of Birth

Used as the time of birth in the sample result message. For the format, such as “YYYY\[MM\[DD\[HH\[MM\[SS\]\]\]\]\]”

PV1 (Patient Visit) contains medical information for the patient. Message example: PV1|1|Hospitalization|Department of Otorhinolaryngology^1203^3^1 area|||||||||||||||||0 Field No. Name Type Length Meaning Example

1 Set ID -PV1 SI 4 Serial number, used to identify the different PV1 message segments in the message.

2 Patient Class IS 1 Patient type, string, content not limited.

3 Assigned Patient Location

PL 80 Patient location information, expressed as “Department^room^ bed number^ward”.

Department of Otorhinolaryngology^1203^3^1 area

4 Admission Type IS 12 Admission No.

20 Financial Class FC 50 Type of fee, string, content not limited.

The OBR (Observation Request) message segment contains primarily the Test Report information: OBR|1||003|01001^Automated Count^99MRC||20181012221000|20190829164756|20190829164756||Doctor

8 Sex IS 1 Patient’s sex, string. Unknown: O Male: M Female: F

9 Pregnant IS 2 Pregnant or not Y-Yes, N-No

Chen||||20181013212500||||||||||HM||||||||admin Field No. Name Type Length Meaning Example

1 Set ID - OBR SI 10 Serial number, used to identify different OBR message segments in the message.

2 Placer Order Number

EI 22 Used as the barcode in the sample test result message. Used to indicate the QC solution name in the QC message.

In the work order query response message, ORC^O02 is used as the sample number.

3 Filler Order Number +

EI 22 Used as the sample number in the sample test result message. Used as QC solution batch number in the QC message.

4 Universal Service ID

CE 200 General service identifier, used to identify the different types of counting results. See the Appendix for specific values.

01001^Automated Count^99MRC

6 Requested Date/Time

TS 26 Application time Used as the sampling time in the sample test result message. Used as the expiry date of QC in the QC information.

20181012221000

7 Observation Date/Time

TS 26 Test time. 20190829164756

8 Result Date/Time

TS 26 Result time 20190829164756

10 Collector Identifier \*

XC N 60 Sample collector. It is used to indicate the deliverer here.

Doctor Chen

13 Relevant Clinical Info.

ST 300 Relevant clinical information. It can be used to indicate clinical diagnosis information in patient information.

14 Specimen Received Date/Time \*

TS 26 Sample receiving time. Used to indicate the time of delivery.

20181013212500

15 Specimen Source \* CM 300 Sample source, used as sample type, serum-SERUM, plasma-PLASMA, whole blood-WH\_BLOOD, trace whole blood-TWH\_BLOOD, urine-URINE, other-OTHER

16 Ordering Provider ST 120

Used as a tester

22 Results Rpt/Status Chng -Date/Time

TS 26 Result reporting/status change-time. Used as the review time.

20190829174255

24 Diagnostic Serv Sect ID

ID 10 Diagnosis section ID. The value is taken as “HM”, which means Hematology.

28 Result Copies To

XCN 200 Main interpreter of the results. Used to indicate the reviewer in the sample message.

The OBX (Observation/Result) message segment mainly contains information about various test result parameters. OBX|5|NM|6820-1^cTnI^LN||0.07|ng/mL|0.00-0.10||||F

Field No. Name Type Length Meaning Example

1 Set ID-OBX SI 10 Serial number, used to identify the different OBX message segments in the message.

2 Value Type ID 3 Data type of the test results, with values taken as “ST”, “NM”, “ED”, “IS”, etc.

3 Observation Identifier

CE 590 Test item identification. The format is “ID^Name^EncodeSys”, where ID is the test item identification, Name is the test item description and EncodeSys is the test item coding system. See the appendix for coding values of various test items.

6801^PCT^LN

4 Observation Sub-ID

- 590 Blank in the sample test result message. Taken as the target value and standard deviation of the test item in the QC message, connected with ^.
5 Observation Value

- 65535 Test result data, which can be numbers, strings, enumerated values, binary data, etc. For the specific values of data, see (Binary data such as histograms and scatter diagrams are converted using Base64 encoding)
0.07 C line weak result, uniformly send “C Line Weak” Uniformly send “\*\*\*” for calculation failure results

6 Units CE 90 Unit of the test item. It is indicated with the ISO standard unit. For the units used for communication, see

7 References Range

ST 90 There are three formats for the range of test results: “Lower limit of reference range - upper limit of reference range” “<Upper limit of reference range” “>Lower limit of reference range” Special processing Use () to identify open intervals and \[\] to identify closed intervals For example: (10-20\], identifying that it is greater than 10 and less than or equal to 20

8 Abnormal Flags

ID 5 Test result flags, with values including: “N”: Normal “A”: Abnormal “H”: Results above the upper limit of the reference range “L”: Results below the lower limit of the reference range Note: This Field may have both abnormal or high and low alarm flags, where multiple flags are connected by “~”, such as “H~A”.

9 Probability ID Item No. (number after subitem combination)

11 Observ Result Status

ID 1 Test result status. The value is taken as “F”, which indicates the final results.

The ORC (Common Order) message segment mainly contains general information related to the Order. Message

ORC|RF||SampleID||IP

#### The field definitions are shown in the table below:

S/N Field Name Data Type

Max. Recomm ended Length

Description Example

1 OrderControl ID 2 Order control. In the ORM message, it is “RF”, indicating “refill order request”. In the ORR message, it is “AF”, indicating “order refill acknowledgement”.

2 Placer Order Number

EI 22 The number of the Order initiator. The value in the ORM message is empty. The value in the ORR message is the sample number.

3 Filler OrderNum

EI 22 The number of the Order receiver. The value in the ORM message is the sample number. The value in the ORR message is empty.

5 Order Status ID 2 Order status. In the work order information query communication ORM message, the value is fixed to “IP”, indicating that “Order is being processed but no result has been obtained”. The value in the ORR message is empty.

QRD (Query Definition), definition of query conditions.

Example: QRD|20200915103050|R|D|258|||1|4\_2|P|IVD||T

S/N Field Name Required to be Output or Not

Data Type Length Meaning

1 Query Date/Time R TS (26) Query date and time 2 Query Format Code R ID (1) Query format code:

D: Display format. R: Record format. T: Table format

3 Query Priority R ID (1) Priority D: Delayed response I: Immediate response

4 Query ID R ST (10) Query ID 5 Deferred Response Type ID (1) Delayed response type

B: Before the delayed response time

L: After the delayed response time 6 Def. Resp. Date/Time TS (26) Delayed response time

S/N Field Name Required to be Output or Not

Data Type Length Meaning

7 Quantity Limited Request R CQ (10) Number of requested entries 8 Who Subject Filter R XCN (60) Query content. It is determined by

the value of domain 9, the position representation method is: test tube rack number - test tube position, for example: 4-2 means test tube rack number 4 and test tube position 2.

9 What Subject Filter R CE (60) Type: OTH: Test tube barcode

10 What Dept. Data Code R CE (60) Department data code. Default: ivd

11 What Data Cd. Value Qua. ST (20) 12 Query Results Level ID (1) Query result level

T: Total results S: Status only

Example: DSP|3||Zhang San|||

S/N Name Output or

Data Type Length Meaning

1 Set ID - Display Data SI (4) S/N ID

2 Display Level SI (4)

3 Data Line R TX (300) Data content

4 Logical Break Point ST (2)

5 Result ID TX (20) Result ID

### Correspondence between ID and content

#### The DSP-3 ID describes the meaning of this data item:

S/N Meaning of Data Item Example

1 Patient’s name Zhang San

2 Sex M: Male

4 Age unit: yr: Year

5 \* Sample type WH\_BLOOD: Whole blood

PLASMA: Plasma

SERUM: Serum

TWH\_BLOOD: Trace whole blood

6 \* Item name PCT

Use ^component separators for multiple items

7 Pregnant or not Y: Pregnant

N: Non-pregnant

8 Sample No.

9 Patient type Outpatient Inpatient Other

10 Department

12 Patient No.

13 Admission No.

14 Submitter

16 Reviewer

17 Sampling date and time The date format is YYYYMMDDHHmmSS

For example: 20061122130540

18 Submission date and time The date format is YYYYMMDDHHmmSS

For example: 20061122130540

21 Diagnosis

Note: Items with ‘\*’ after the S/N are necessary ones.

## Example of complete message

### Sample information

1) Example of sending:

MSH|^~\&|Q3|Zybio|||20220104192722||ORU^R01|202201041927229109|P|2.3.1||||||UNICODE SFT|Zybio|1.1|EXR100|q20-gc14|| PID|1||binlihao^^^^MR||xingmin^|||M|N PV1|1|huanzheleixin|keshi^^chuanghao|zhuyuanhao|||||||||||||||| OBR|3008||44rr|01001^Automated Count^99MRC||20211223165200|20211223165240|||songjianzhe|||zhenduan|20211223165200|PLASMA|jian yanzhe||||||||HM|||||||| OBX|1|IS|03001^Take Mode^99MRC||O||||||F OBX|2|NM|31525-0^Age^LN||12|yr|||||F OBX|3|IS|09001^Remark^99MRC||beizhu||||||F OBX|4|IS|03004^Sys Seq^99MRC||3008||||||F OBX|5|IS|03005^Worklist Seq^99MRC||-1||||||F OBX|6|NM|6806-1^SAA^LN||125.00|μg/mL|<10|A~H|6806||F

2) Example of acknowledgment: MSH|^~\&|||Q3| Zybio |20190905144801||ACK^R01|2201909051448014486|P|2.3.1||||||UNICODE MSA|AA|202201041927229109

### Example of QC

1) Example of sending: MSH|^~&|Q3|Zybio|||20181030120008||ORU^R01|2018103012000847670|Q|2.3.1||||||UNICODE PID|1||^^^^MR||^||20181030|0 OBR|1||1|01003^LJ QCR^99MRC||20181030115259|||||||||||||||||||HM|||||||| OBX|1|IS|03001^Take Mode^99MRC||O||||||F OBX|2|IS|03002^Blood Mode^99MRC||W||||||F OBX|3|IS|03003^Test Mode^99MRC||0||||||F OBX|4|IS|03004^Qc Level^99MRC||M||||||F OBX|5|NM| 6801^PCT^LN||0.45|ng/mL|<0.50||6801|N|F

2) Example of acknowledgment: There is only one difference between the QC acknowledgment message and the counting result acknowledgment message: the value of the MSH-11 field is Q. The following is an L-J QC message ACK.

MSH|^~&|||Q3|Zybio|20181030120008||ACK^R01|2018103012012843621|Q|2.3.1||||||UNICODE MSA|AA|2018103012000847670

### Example of bidirectional LIS query request

1. The instrument sends request to LIS (QRY^Q02):

Note: The message ID: 494, queried by the test tube barcode (123456)

<SB>MSH|^~\&|Q3|Zybio|||20200915103050||QRY^Q02|20220528152659|P|2.3.1||||||ASCII|||<CR>

QRD|20200915103050|R|D|258|||1|123456|OTH|IVD||T<CR>

2. LIS requests acknowledgement from the instrument (QCK^Q02)

<SB>MSH|^~\&|Q3|Zybio|||20200915103050||QCK^Q02|20220528152722|P|2.3.1||||||ASCII|||<CR>

MSA|AA|20220528152659|Message accepted|||0|<CR>

QAK|SR|OK|<CR>

3. LIS responds to the instrument request and returns work order information and test items

Sample information: Zhang San, female (F), 24 years old, whole blood (WH\_BLOOD), PCT project

<SB>MSH|^~\&|LIS||||20200915103050||DSR^Q03|20220528152812|P|2.3.1||||||ASCII|||

QAK|SR|OK|<CR>

MSA|AA|20220528152659|Message accepted|||0|<CR>

QRD|20200915103050|R|D|258|||1|123456|OTH|IVD||T<CR>

DSP|1||Zhang San||<CR>

DSP|2||F||<CR>

DSP|3||24||<CR>

DSP|4||yr||<CR>

DSP|5||WH\_BLOOD||<CR>

DSP|6||PCT||<CR>

4. Acknowledge the LIS response by the instrument (ACK^R03):

<SB>MSH|^~\&|LIS||||20200915103050||ACK^R03|20220528152659|P|2.3.1||||||ASCII|||<CR> MSA|AA|20220528152659|Message accepted|||0|<CR> ERR|0|<CR> <EB><CR>

4. Appendix: Definition of Message Code

## OBR-data item types

In the HL7 protocol, the OBR-4 (Universal Serview ID) field is used to identify the type of test result, such as sample test result, QC counting result, represented in the format of “ID^Name^EncodeSys”. All code values for this field are shown in the table below.

ID Name Meaning EncodeSys

01001 Automated Count Counting results 99MRC

02001 QCR QC counting results 99MRC

## OBR-data item types

In the HL7 protocol, the OBR-3 (Universal Serview ID) field is used to identify the type of some special information, such as age, reference group, remark, represented in the format of “ID^Name^EncodeSys”. All code values for this field are shown in the table below.

For example, OBX|6|NM|6801-1^PCT^LN||13.91|10^9/L|3.50-9.50||||F

S/N Value Meaning

OBX-2 indicates the HL7 data type of the carried

3 6801-1^PCT^LN OBX-3 (Observation Identifier) is the identifier

of a data item, expressed as

“ID^Name^EncodeSys”.

OBX-5 contains data item values;

OBX-6 contains parameter units, expressed in

ISO standard units.

7 3.50-9.50 Range of test result, in the form of “lower limit

of reference range- upper limit of reference

range”, or “< upper limit of reference range”

or “> lower limit of reference range”.

## Table of Data Item Types and Coding Systems

Data Item HL7 Type

ID Name EncodeSys Example of OBX-3 Field

Other Data Item

Sample injection mode

IS 03001 Take Mode 99MRC 03001^Take Mode^99MRC

Measurement mode IS 03003 Test Mode 99MRC 03003^Test Mode ^99MRC

Work order serial number

IS 03005 Worklist Seq 99MRC 03005^Worklist Seq^99MRC

QC level IS 03006 Qc Level 99MRC 03006^Qc Level^99MRC

Batch No. NM 03008 Qc lot No 99MRC 03008^Qc lot No^99MRC

Transmission No. ST 03009 Transmission No

99MRC 03009^Transmission No^99MRC

Valid date ST 03010 Qc valid date 99MRC 03010^Qc valid date^99MRC

Test tube position ST 03011 Tube position 99MRC 03011^Tube position^99MRC

Age NM 31525-0 Age LN 31525-0^Age^LN

Reference group IS 04001 Ref Group 99MRC 04001^Ref Group ^99MRC

Remarks IS 09001 Remark 99MRC 09001^Remark^99 MRC

#### List of channel numbers for uploading:

Parameter Name Channel No.

CK-MB CK-MB

NT-proBNP NT-proBNP

hs-CRP hs-CRP

S100β S100β

CRP/SAA CRP/SAA

25-OH-VD 25-OH-VD

hs-cTnI hs-cTnI

HbA1c HbA1c

nCoV NAb nCoV NAb

nCoV T nCoV T

#### List of channel numbers for downloading:

Parameter Name Channel No.

NT-proBNP NT-proBNP

S100β S100β

CRP/SAA CRP/SAA

25-OH-VD 25-OH-VD

PGI/PGII PGI/PGII

HbA1c HbA1c

nCoV NAb nCoV NAb

nCoV T nCoV T

3in1-I 3in1-I

MxA/CRP MxA/CRP

#### Table of communication parameter unit:

Parameter Units Shown on Software Interface Communication Parameter Unit (OBX-6)

μg/mL μg/mL

ng/mL ng/mL

pg/mL pg/mL

mIU/L mIU/L

nmol/L nmol/L

yr (age unit) yr

mo (age unit) mo

w (age unit) w

d (age unit) d

hr (age unit) hr

## OBX custom enumeration values

The OBX message data adopt self-defined enumerated values, and the meanings of some key data values are

shown in the following table:

Data Item Enumerated Value

Sample type Whole blood: WH\_BLOOD

Plasma: PLASMA

Serum: SERUM

Trace whole blood: TWH\_BLOOD

Blood type The format is “AB, RH”.

Wherein, the AB blood type includes “A”, “B”, “AB” and “O”;

the RH blood type includes “RH+”, “RH-”.

QC level “L”: Low

“M”: Moderate

