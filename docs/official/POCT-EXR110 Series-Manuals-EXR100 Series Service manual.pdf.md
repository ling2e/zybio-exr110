# POCT-EXR110 Series-Manuals-EXR100 Series Service manual.pdf

Fluorescence Immunochromatography

(Models: EXR 100、EXR 110、EXR 120)

Service Manual

First edition (March, 2023) © Copyright Zybio 2023. All rights reserved.

Intellectual property rights statement

The instrument and its incorporated software described in the Operation Manual (hereinafter referred to as the Manual) are for veterinary diagnostic use only. Zybio Inc. (hereinafter referred to as Zybio) owns the copyright over the instrument information, scheme descriptions, and relevant graphics (hereinafter referred to as Information) in this manual and the intellectual property rights over the instrument(s) herein. The Information may be used if:   The copyright notice appears on all copies;  The Information is not modified;   The Information is used as operating instructions or for informational purpose by Zybio

or its local distributor; and  Without Zybio’s authorization or written permission, no graphics are used separate

from the accompanying text of the manual. Users of the Information shall assume full responsibility and all risks arising from illegal or illegitimate use of the Information. Zybio reserves the right to add, delete, or modify the Information at any time as part of ongoing instrument development without prior notification.

Disclaimers

All sample data in the manual (including but not limited to, the sample data in printouts, graphics, screens, etc.) are for reference only and shall not be used for clinical or maintenance evaluations. Data shown in printouts and screens do not reveal actual animal patient names or test results. Labels depicted in the manual may appear different from actual labeling and are for reference only. Please take the actual labeling as the final. Instrument users shall follow the operating instructions at any time. Zybio and its affiliates shall not be responsible for failures, errors, damages, losses, or other liabilities resulting from users’ noncompliance with the procedures and precautions given herein. In the event that any user should make any oral, written or electronic response to Zybio (such as feedback, questions, comments, suggestions, ideas, etc.), such response and any information submitted therewith shall be considered non-confidential, and Zybio shall be free to reproduce, publish, or otherwise use such information for any purposes whatsoever including but not limited to, the research, development, manufacture, service, use, or sale of instruments incorporating such information. Zybio is not engaged in providing medical advice or services. Updates to the information may be provided in electronic form or paper. Always refer to the latest documents for the latest information.

,  and  are the registered trademark of Zytopia Ltd.

Other trademarks referenced are property of their respective owners; ® and ™ are not specified in the manual.

Warranty statement

Zybio warrants the instrument against defects in materials and workmanship for a period of one year from the delivery date. If the instrument proves to be defective within the foregoing warranty period, Zybio, at its sole option, will repair, upgrade, replace the instrument or take other corrective measures. The sales contract is your only warranty certificate and please keep it properly.  The free service is provided within the warranty period for the entire instrument, except for the consumables (Consumables refer to the disposable items that need to be replaced after each use or the fragile materials that need to be replaced regularly). This warranty does not cover and is void with respect to the defects or malfunctions caused by:  Accident, neglect, misuse, relocation, unauthorized repair or modification of the

instrument, whether intentional or unintentional;  Using non-approved parts, accessories, consumables, etc.;  Installing instruments by the personnel not authorized by Zybio or its local distributor

and/or not using the instrument according to instructions in this manual; and  Force majeure, such as war, natural disaster, etc. The limited warranty in this manual and the sales contract is the sole warranty provided by Zybio. No other warranties, express or implied, including warranties of merchantability or fitness for a particular purpose, are provided whatsoever. In no event will Zybio be liable for any direct, indirect, consequential or incidental damages, including loss of profits and commercial opportunities, or for any claim by any third party, arising out of the use, the results of use or the inability to use this instrument. If the warranty period and/or the warranty service described herein are conflict with the provisions of sales contract executed, the latter shall prevail. For customer service, please contact: Zybio Inc. Floor 1 to Floor 5, Building 30, No.6 of Taikang Road, Block C of Jianqiao Industrial Park, Dadukou District, 400082 Chongqing, PEOPLE’S REPUBLIC OF CHINA Tel: +86 (0) 23 6895 9999 Fax: +86 (0) 23 6869 9779 Web: https: //www.zybio.com E-mail: info@zybio.com

1 General introduction .............................................................................................................. 1 1.1 Revision history ............................................................................................................... 1 1.2 Scope of application ....................................................................................................... 1 1.3 Intended use .................................................................................................................... 1 1.4 About this manual........................................................................................................... 1 1.5 Symbols ........................................................................................................................... 2 1.6 Precautions on use ......................................................................................................... 4 1.7 Return procedure ............................................................................................................ 5

2 Product information ............................................................................................................... 7 2.1 Product overview ............................................................................................................ 7 2.2 About the Analyzer .......................................................................................................... 8

2.2.1 Models ...................................................................................................................... 8 2.2.2 Parameters and performance ............................................................................... 8 2.2.3 Specifications and configuration .......................................................................... 8 2.2.4 Status ..................................................................................................................... 10

3 Installation ............................................................................................................................. 11 3.1 General introduction .................................................................................................... 11 3.2 Tools ............................................................................................................................... 11 3.3 Installation process ...................................................................................................... 11 3.4 Installation requirements ............................................................................................ 13

3.4.1 Installation space requirements ......................................................................... 13 3.4.2 Environment requirements ................................................................................. 13 3.4.3 Power requirements ............................................................................................. 14

3.5 Unpacking ...................................................................................................................... 14 3.5.1 Examination before unpacking ........................................................................... 14 3.5.2 Main unit unpacking ............................................................................................. 15 3.5.3 Appearance inspection ........................................................................................ 15

3.6 Main unit movement .................................................................................................... 15 3.7 Fixing removal ............................................................................................................... 16

3.7.1 Tape removal ......................................................................................................... 16 3.7.2 Removal of motion component fixing screws ................................................... 16

3.8 Connecting instrument ................................................................................................ 17 3.8.1 Connection of the power cord and power adapter .......................................... 17 3.8.2 Connection of bar code scanner ......................................................................... 17 3.8.3 Connection to external printer (user supplied) ................................................. 17 3.8.4 Installation of waste card collection box ........................................................... 18

3.8.5 Installation of printer paper ................................................................................ 18 3.9 Start up........................................................................................................................... 19

3.9.1 Before startup check ............................................................................................ 19 3.9.2 Login ....................................................................................................................... 19

3.10 Setup .............................................................................................................................. 20 3.10.1 Test settings .......................................................................................................... 21 3.10.2 Print setup ............................................................................................................. 21 3.10.3 Hospital settings ................................................................................................... 22 3.10.4 Communication setup .......................................................................................... 23 3.10.5 Language setup ..................................................................................................... 24

3.11 Status confirmation ...................................................................................................... 25 3.11.1 Temperature confirmation .................................................................................. 25 3.11.2 Card reading confirmation................................................................................... 25 3.11.3 Motion confirmation ............................................................................................. 26 3.11.4 Light source status confirmation ........................................................................ 27 3.11.5 QR code Scanning confirmation ......................................................................... 27 3.11.6 Performance validation........................................................................................ 28

3.12 Exporting logs ................................................................................................................ 31 4 Debugging and calibration .................................................................................................. 33

4.1 Debugging ...................................................................................................................... 33 4.2 Temperature calibration .............................................................................................. 33 4.3 Light spot status confirmation .................................................................................... 34 4.4 Optical calibration ........................................................................................................ 35 4.5 QR code Scanning confirmation ................................................................................. 36 4.6 Card reading confirmation .......................................................................................... 36

5 Maintenance .......................................................................................................................... 37 5.1 Maintenance requirements ......................................................................................... 37 5.2 Screen calibration ......................................................................................................... 38 5.3 Emptying, cleaning and disinfection of waste card collection box ........................ 38 5.4 Instrument cleaning ..................................................................................................... 38 5.5 Printer paper replacement .......................................................................................... 39

6 Troubleshooting ................................................................................................................... 41 6.1 Fault code and warning mechanism .......................................................................... 41 6.2 LIS connection failure ................................................................................................... 43

6.2.1 Fault code and warning mechanism .................................................................. 43 6.2.2 Fault analysis and troubleshooting .................................................................... 44

6.3 External printer failure ................................................................................................. 46 6.3.1 Fault code and warning mechanism .................................................................. 46 6.3.2 Fault analysis and troubleshooting .................................................................... 46

6.4 Temperature related failure ........................................................................................ 46 6.5 Communication fault ................................................................................................... 49

7 Software ................................................................................................................................. 51 7.1 Login ............................................................................................................................... 51 7.2 Software interface introduction .................................................................................. 51 7.3 Function list and authority category .......................................................................... 52 7.4 Settings .......................................................................................................................... 55

7.4.1 Basic settings ......................................................................................................... 55 7.4.2 System settings ..................................................................................................... 58 7.4.3 User settings .......................................................................................................... 63

7.5 Service ............................................................................................................................ 63 7.5.1 Version .................................................................................................................... 63 7.5.2 Self-test .................................................................................................................. 64 7.5.3 Maintenance .......................................................................................................... 65 7.5.4 Log .......................................................................................................................... 65

7.6 Status interface ............................................................................................................. 66 7.6.1 Monitoring ............................................................................................................. 66 7.6.2 System information .............................................................................................. 67

7.7 Status prompt ............................................................................................................... 67 7.7.1 battery percentage ............................................................................................... 67 7.7.2 Buzzer ..................................................................................................................... 67

7.8 Printer connection ........................................................................................................ 68 7.8.1 Recommended printer models ........................................................................... 68 7.8.2 Print setup ............................................................................................................. 68 7.8.3 Connect External printer ...................................................................................... 68 7.8.4 Print the report ...................................................................................................... 69 7.8.5 Troubleshooting ................................................................................................... 69

7.9 Upgrade ......................................................................................................................... 69 7.9.1 Preparation ............................................................................................................ 69 7.9.2 Steps ....................................................................................................................... 69 7.9.3 Upgrade status verification ................................................................................. 69 7.9.4 Upgrade process abnormal handling ................................................................. 69

8 Hardware system .................................................................................................................. 71 8.1 About hardware System ............................................................................................... 71 8.2 Hardware system composition ................................................................................... 71

8.2.1 Hardware subsystem components of the complete machine accessories ... 72 8.2.2 PCBA card layout for the hardware subsystem ................................................. 74

8.3 Functions of the circuit board ..................................................................................... 75 8.3.1 Master control board ............................................................................................ 75

8.3.2 Driver board ........................................................................................................... 83 8.3.3 Optical detection PCBA ........................................................................................ 88 8.3.4 Lithium battery charging pad .............................................................................. 90

8.4 Indicator light status of the PCBAs: ............................................................................ 93 9 Mechanical system ............................................................................................................... 95

9.1 About mechanical system ............................................................................................ 95 9.2 Appearance: ................................................................................................................... 95 9.3 Mechanical component structure ............................................................................... 98

9.3.1 Top panel assembly .............................................................................................. 98 9.3.2 Bottom panel assembly ....................................................................................... 99 9.3.3 Bottom panel assembly .................................................................................... 100 9.3.4 Card compartment assembly ........................................................................... 101 9.3.5 Top panel removal ............................................................................................. 103 9.3.6 Coin cell battery disassembly (mainly for customs inspection) ................... 104 9.3.7 Middle panel removal ........................................................................................ 105

10 Optical system ................................................................................................................ 107 10.1 Principle of optical system........................................................................................ 107 10.2 Optical system structure ........................................................................................... 107

10.2.1 General introduction ......................................................................................... 107 10.2.2 Introduction to the optical path of optical systems ...................................... 108

10.3 Optical system maintenance and replacement ..................................................... 108 10.3.1 Precautions ......................................................................................................... 108 10.3.2 Optical system maintenance ............................................................................ 109 10.3.3 Replacement of optical system assembly....................................................... 109

Appendix Complete machine wiring diagram ........................................................................ 113

General introduction

1 General introduction

1.1 Revision history

Version Revision Date: Revised contents

01 March 31, 2023 First release

1.2 Scope of application

This service manual is for persons who:   have a comprehensive knowledge of electrical circuits;  supporting reagents and quality control and other related matters;  troubleshooting;   be able to operate and commission this analyzer proficiently;  be able to use basic mechanical tools and understand relevant terminology.

1.3 Intended use

The Fluorescence Immunochromatography Analyzer is used with supporting reagents produced by Zybio to perform quantitative detection of analytes derived from human serum, plasma, and whole blood samples, helping clinical practice. Supporting reagents include: full-range C-reactive protein (hs-CRP + conventional CRP), serum amyloid A, myoglobin, creatine kinase isoenzyme, D-Dimer, calcitoninogen, cardiac troponin T, N-terminal brain natriuretic peptide precursor, glycosylated hemoglobin and interleukin-6.

1.4 About this manual

This Manual consists of 10 chapters. The readers may refer to the relevant chapter for the information needed.

Chapter Content

1 This chapter mainly introduces the revision history of the instrument, scope of application, intended use, symbol description, precautions, return procedures, etc.

2 This chapter mainly introduces basic information, model differences, performance parameters, specification configurations, status alerts, etc. of the analyzer

3 This chapter mainly introduces installation requirements of the analyzer.

4 This chapter mainly introduces analyzer status confirmation and calibration.

5 This chapter mainly introduces the maintenance methods of the analyzer.

General introduction

Chapter Content

6 This chapter mainly introduces the common fault information of the analyzer and how to deal with it.

7 This chapter mainly introduces the basic functions of the analyzer software.

8 This chapter mainly introduces the composition of each part of the mechanical system of the analyzer.

9 This chapter mainly introduces the structure of the hardware system of the analyzer and the composition of each PCBA.

10 This chapter mainly introduces the analyzer's optical system and the main fault repair methods of the optical system.

1.5 Symbols

This chapter describes the symbols used on the Analyzer or in the Manual.

Table 1-1 Symbols on the Analyzer and its package

Symbols Explanation

Indicates that there are potential biological risks associated with the medical device, necessary to consult instructions for use for details.

Indicates the need of taking care regarding the hazard specified by the supplementary sign; the user needs to consult the instructions for use (yellow background).

Indicates the need for the user to consult the instructions for use for important cautionary information (white background).

Indicates the instrument that is intended to be used as an in vitro diagnostic medical device.

Indicates the manufacturer's serial number so that a specific medical device can be identified.

Indicates the manufacturer's catalogue number so that the medical device can be identified.

Indicates a carrier that contains unique device identifier information.

Indicates the authorized representative in the European Community.

Indicates CE marking of conformity.

Indicates the date when the medical device was manufactured.

Indicates the medical device manufacturer.

General introduction

Symbols Explanation

Indicates the need for the user to consult the instructions for use.

Indicates that this equipment is classified as Waste Electrical and Electronic Equipment under the European WEEE Directive. It must be recycled or disposed of in accordance with applicable local requirements.

Indicates that the device is suitable for alternating current only.

Indicates that the device is suitable for direct current only.

OFF Indicates disconnection from the mains.

ON Indicates connection to the mains.

Indicates the connecting terminals of the computer network.

Indicates the USB interface.

Indicates that distribution packages shall be kept away from rain and be kept in dry conditions.

Indicates the correct upright position of the distribution package for transport and/or storage.

Indicates that contents of the distribution package are fragile therefore it shall be handled with care.

Indicates the maximum number of identical transport packages/items which may be stacked on the bottom package.

Indicates that distribution packages shall not be rolled or turned over.

Indicates that distribution packages shall be stored, transported, and handled within temperature limits.

Indicates that distribution packages shall be stored, transported, and handled within humidity limits.

General introduction

Symbols Explanation

Indicates that distribution packages shall be stored, transported, and handled within atmospheric pressure limitation.

Table 1-2 Symbols used in the Manual

Symbols Explanation

Indicates a reference to substances that may be hazardous to men, animals, plants, or the environment based on biological activity.

Indicates a situation that, if not avoid, could result in hazards or other serious adverse consequences from the use of an IVD medical device.

Indicates a potentially hazardous situation which, if not avoid, could result in minor or moderate injury, or damage of the IVD medical device or incorrect results.

Indicates the important information or content that requires the attention of the operator.

1.6 Precautions on use

This section describes mainly the items that require special attention during analyzer maintenance. To use your Analyzer safely and effectively, observe the following precautions. If the Analyzer is used in a manner not specified by the manufacturer, it may damage the Analyzer or cause harm to the operator.

All items (samples, reagent cards, quality control cards, calibrators, etc.), as well as areas in contact with these items, have potential biological risks. The operator shall strictly abide by the laboratory safety regulations and wear personal protective equipment (laboratory protective clothing, gloves, etc.) when contacting relevant items and areas in the laboratory.

 It is important for the hospitals or institutes that employ this Analyzer to carry out a

reasonable service/maintenance plan. Neglect of this may result in analyzer breakdown or personal injury.

 Do not use flammable gases (e.g. anesthetics) or flammable liquids (e.g. ethanol) in the vicinity of this product, as there is a risk of explosion.

 The power must be switched off when carrying out repairs. Performing repairs with the power on risks electric shock and damage to electrical components.

 Connecting the analyzer to a socket with a separate fuse and protective switch. Connecting the analyzer to the same fuse and protective switch with other equipment (e.g. life support equipment) may result in tripping if the machine malfunctions, if an overcurrent is generated, or if a momentary inrush current is generated when the machine is switched on.

General introduction

 The clothing, hair, and hands of the service personnel must be kept at a distance from moving components, such as the motor, to prevent them from being caught in the moving parts during servicing.

 The operator is obliged to comply with local national and regional regulations on the discharge and disposal of reagents, liquid waste, waste samples, consumables, etc.

 Device disposal: some substances of the discarded analyzers are regulated by pollution regulations. Please observe the local regulations on disposal of discarded analyzers.

 The reagents can cause irritation to eyes, skin and mucous membranes. When contacting items related to reagents in the laboratory, the operator shall strictly abide by the laboratory safety regulations, and wear personal protective equipment (laboratory protective suit, gloves, etc.).

 Rinse immediately with plenty of water once the reagent contacts with skin or eyes. If necessary, please contact doctors for medical treatment.

 Be sure to operate the analyzer under the situation specified in the service manual; otherwise, the analyzer may not work properly and the analysis results will be unreliable, which may damage the analyzer components and cause personal injury.

 Data backup: the Analyzer saves the data in the computer hard disk. If the data on the hard disk is deleted, or if the hard disk has been damaged due to other reasons, the data cannot be recovered. If necessary, periodically back up the analysis data to other mobile storage devices.

1.7 Return procedure

For returns, please contact the after-sales service department of Zybio.

Product information

2 Product information

2.1 Product overview

Category Basic Information

Product Name Fluorescence Immunochromatography Analyzer

Model Type EXR 100、EXR 110、EXR 120

Product structure and composition

The Analyzer is composed of the main unit, power adapter and software. The main unit includes a reagent card incubation module, a photoelectric detection module, a touch screen, a barcode scanning module, an RFID reading module, an internal battery (optional), and a control and data processing module. The software incorporated in the instrument is a control software.

Intended purpose

The Analyzer is based on dry immunofluorescence technology and is used together with supporting reagents to perform immunoquantitative detection of analytes derived from human serum, plasma samples in clinical practice. The test items include myocardium-related, infection-related, and blood glucose.

Classification of device Class A

Manufacturer Zybio Inc.

Manufacturer address Floor 1 1 to Floor 4, Building 30, No.6 of Taikang Road, Block C of Jianqiao Industrial Park, Dadukou District, Chongqing, PEOPLE’S REPUBLIC OF CHINA A

Registered address of the manufacturer

Floor 1 to Floor 4, Building 30, No.6 of Taikang Road, Block C of Jianqiao Industrial Park, Dadukou District, Chongqing, PEOPLE’S REPUBLIC OF CHINA

Manufacturing date Refer to the instrument nameplate.

Service life 5 years1

Contraindications None

1 In the process of use, the user shall maintain or repair the Analyzer according to this manual. The product which remains basic safety and performance after maintenance or repair can be used normally.

#### Product information

2.2 About the Analyzer

2.2.1 Models

The Analyzer covers three models: EXR 100、EXR 110、EXR 120. The operation, working principle, main functions, and composition of the three models are exactly the same. Refer to the following table for the difference among the three models.

Models EXR 100 EXR 110 EXR 120

Channel (quantity) 1 3 3

Sample data storage (pcs.)

30,000 pieces of data

29,000 pieces of data

28,000 pieces of data

Software name Fluorescence Immunochromatography Analyzer Software

Software models EXR 100 EXR 110 EXR 120

#### Software release version

2.2.2 Parameters and performance

This section introduces the parameters and performance of the Analyzer, as shown in the following table:

Item Description

Accuracy The relative deviation should not be more than ±15%.

Repeatability The coefficient of variation (CV) should not be greater than 1%.

Linearity The linear correlation coefficient (r) should not be lower than 0.990.

Channel consistency The relative range (R) of the measurement results for each channel should not exceed 5% (EXR 100 is not applicable)

Stability The relative deviations between the measurements at 4 h and 8 h after the device is started and in a stable status and those at the beginning of the stable working status should not be greater than 5%.

2.2.3 Specifications and configuration

This section mainly describes the Analyzer’s specifications and configuration, as shown in the following table:

Item Description

Instrument Dimensions

 Length: 275 mm  Width:250 mm  Height:186 mm

Product information

Item Description

Weight  3.7 kg (with battery)  3.2 kg (without battery)

Input/output device  Touch screen  Thermal printer  Buzzer

Main unit interface  Power adapter interface: 1  Network interface: 1  USB interface: 2

power supply  Adapter input: 100–240 V AC, 50/60 Hz, 1.4-0.7 A；  Machine input: 24 V 2.5 A, 60 W MAX；  Internal lithium battery (optional): 18 V, 4700 mAh, 84.6 Wh

Channel 3 Channel ( EXR 110，EXR 120), single channel (EXR 100)

Sample type Serum, plasma, whole blood

Select the test mode  Single: standard test mode, quick test mode  Multi: standard test mode, quick test mode

Smart identification Automatic identification of test items and reagent batches

Smart timing Automatic calculation of the incubation time in standard test mode and automatically start the test when the incubation time is up.

Incubation temperature

The incubation area contains the temperature control system, with an incubation temperature of 27 °C to 37 °C.

Error alarm Supports audible buzzer alarms

Control method 8.0-inch touch screen

Printing  The analyzer has a built-in thermal printer and supports external USB printers.

Storage capacity  More than 30,000 results.

Network Requirements Network type is LAN, no required bandwidth.

Software name Fluorescence Immunochromatography Analyzer Software

Software models EXR 100，EXR 110，EXR 120

Software release version V1

Product information

Item Description

Data interfaces

 Wired network interface: The software performs two-way data transmission with the laboratory LIS via the HL7 transmission protocol and one-way data transmission to Zybio’s maintenance system via the TCP/IP transmission protocol.

 Wireless network interface: The software performs two-way data transmission with the User LIS via Wi-Fi using the TCP/IP transmission protocol, and it conducts one-way data transmission to Zybio’s maintenance system via 4G communication, remotely transmitting equipment data such as instrument faults, etc.

 USB interface: The software carries out electronic data exchange with storage media such as flash drives, etc. Data can be exported in “.xml”, “.pdf”, “.log” or “.csv” formats. The USB protocol version is USB 2.0;

 RFID interface: The software communicates with the RFID reader through the Uart serial port, and users can enter the information of the reagent cards and quality control cards by placing the RF card close to the RFID reader.

User access control mechanism

A login password is required by the Analyzer software for user identification. The software should have a user control mechanism, including user identification method (user name and password), user type and permissions (ordinary user, administrator, equipment maintenance personnel). Among them, the ordinary user can change the login password; the administrator can manage ordinary users (create, delete, change password), manage sample results (delete, review, cancel review) and perform system settings; the equipment maintenance personnel have all permissions (sample results management, user management, system settings and maintenance, etc.)

Requirements related to software environment updates

Software Function The software supports sample type selection, adding patient information, instrument status display, result query and printing, one-way or two-way transmission from the LIS system, system setup, and engineer maintenance functions.

2.2.4 Status

Buzzer The buzzer sounds the alarm to remind the user that malfunctions occurred on the instrument. The buzzer alarm sound can be switched off automatically after a touch of the screen.

Installation

3 Installation

3.1 General introduction

The installation guide is the normative document that guides the engineer in the installation of a product on site, which includes: pre-installation preparation, installation, commissioning, verification, and acceptance.

This section mainly introduces the tools that may be used for installation and maintenance.

No. Tools Unit Quantity Remarks

1 M2 Hexagon socket screw 1.5 Inner hexagon wrench

piece 1 Fixing screws for RFID, 4G modules etc.

2 M2.5 inner hexagon socket head cap screws. #2 Inner hexagon wrench

piece 1 Optocoupler stopper fixing screw

3 M3 Hexagon socket screw #2.5 Inner hexagon wrench

piece 1 Upper case fixing screws (length to be greater than 90mm), accessories

4 M4 Hexagon socket screw #3 Inner hexagon wrench

piece 1 Motion assembly fixing screws, middle cover fixing screws, accessories

5 M2 Phillips screw Phillips screwdriver

piece 1 fixing screw for the incubation position on the mounting plate of the temperature control assembly (single channel models)

6 M3 Phillips screw Phillips screwdriver

piece 1 Fixing screws for PCBAs, etc.

7 Flexible ruler piece 1 Installation space confirmation

8 Scissor piece 1 Packing removal

3.3 Installation process

This section introduces the brief process of installing the analyzer.

No. Content Item

1 Quantity count of goods The quantity of goods is correct.

Installation

No. Content Item

and pre-opening checks No inversion or deformation in the outer packaging.

No signs of water in the outer packaging.

No signs of crash in the outer packaging.

No sign of unpacking in the outer packaging.

2 Inspection and detailed inventory of goods after unpacking

All goods listed in the packaging list are complete.

No breakage, collision or deformation on the instrument, and no scratch on the screen.

3 Setting of the Analyzer

The site where the instrument is placed shall be flat and subject to no direct sunlight, and keeps away from radiology department, elevator room, brush motor or high-frequency high-power instruments as far as possible.

Enough space left for instrument heat dissipation: 80mm for rear side.

4 Connecting the Analyzer Check the power supply, which requires 220 V AC, 50Hz; stable voltage and good grounding; independent power supply.

5 Fixing removal Remove tape on the card compartment and switches, and running part fixing screws.

6 For initial powering on, check the position of moving parts.

For initial powering on, enter the user name and password to login, and the Analyzer will reset when starting up. If the reset runs normally, it indicates the moving parts of the instrument free from the obstructions.

7 Status confirmation  Verify analyzer temperature, card reading, motion, light source, and bar code scanning status, and perform performance checks.

8 Parameter setup Setup the parameter's detail on the software of the Analyzer.

9 Shutdown Exit the software of the Analyzer and the shutdown runs normally. Take care to tidy up the site after installation.

10 Training Training for customers in sample operation, instrument maintenance, switching on and off, and notes on instrument use.

11 Training assessment Domestic: hands-on follow-up; International: hands-on training.

12 Acceptance procedures Customer Acceptance Form, Service Order

#### Installation

3.4 Installation requirements

Prior to installation, only when requirements on installation space, power supply, and environment are met can the installation be made.

3.4.1 Installation space requirements

The space requirements for instrument installation are as shown in the figure below.

Figure 3-1 Installation space requirements

3.4.2 Environment requirements

The working and operation environment of the device should meet the following requirements.

Item Working environmental requirements

Ambient temperature 10℃–30℃

Relative humidity 20%–85%, no condensation

Atmospheric pressure 700 hPa–1060 hPa

Altitude ≤ 3000 m

 For indoor installation and use only;  Rated pollution degree: 2;  The bench or desk on which the device is placed should be flat with a gradient of less

than 1/200 and can withstand a weight of at least 16 kg; the bench or desk (or ground) has no vibration;

Installation

 The environment should be with minimum dust, and free from corrosive and flammable gases;

 Avoid direct exposure to strong sunlight, and avoid placing the Analyzer near heat or wind source;

 There should be no high noise source or power interference;  Keep away from brush engines and electrical contacts that are often switched on and

off;  Keep away from the device that emits electromagnetic waves, such as mobile phones,

radio transceivers, etc.;   The site should be far away from strong electromagnetic field interference and well

grounded.  Please do not place the Analyzer in a site where it is difficult to be disconnected.

The operating environment should be well ventilated to ensure heat dissipation. Ventilation equipment can be used where necessary. However, direct airflow to the Analyzer should be avoided, or it may affect the data reliability.

3.4.3 Power requirements

This section mainly describes the power supply requirements.

Power type Specification

External power supply (power adapter) Input: 100-240 V, 50/60 Hz, 1.4-0.7 A Output: 24 V 2.5 A, 60 W MAX.

Internal power supply (lithium battery, standard on EXR120) 18 V , 4700 mAh, 84.6 Wh

 Make sure that the protective grounding of the power socket is good. Incorrect

grounding may cause electric shock and damage to the Analyzer.  The output voltage of the power socket must relevant requirements.  Please use the power cord and power adapter supplied with the device. Using other

power cords and power adapters may damage the instrument or cause erroneous test results.

3.5 Unpacking

All analyzers packaging has gone through a strict inspection performed by Zybio before delivery. When you receive this analyzer, check carefully before unpacking and notice whether the followings exist:

3.5.1 Examination before unpacking

 Inversion or deformation in the outer packaging;

Installation

 Obvious signs of water in the outer packaging;  Obvious signs of crash in the outer packaging;  Signs of unpacking in the outer packaging;  Carefully check whether cracks, bruises, or deformation occurs on all instruments and

components' appearance.

3.5.2 Main unit unpacking

(1) Pull the package into place to ensure that there is enough space to unpack it. (2) After unpacking, make sure that the whole package is complete and that the

accessories are all provided according to the packing list. This way to ensure safety during the movement of the instrument and contact after-sales service if needed. Here are the main accessories on the packing list:

Accessories Quantity

Power cable 1

Power adapter 1

Network cable 1

Waste card collection box 1

Instructions for use 1

Packaging list 1

User Acceptance Form 2

Certificate of conformity 1

Quick guide 1

Battery (standard with EXR120) 1

Bar code scanner 1

3.5.3 Appearance inspection

(1) Check the face shell of the instrument for distortion and damage; (2) Check the instrument screen for damage.

3.6 Main unit movement

Once unpacked, the instrument can be carried to the installation area by the portable handle on the top of the instrument or by holding its bottom with both hands, as shown in the diagram below.

Installation

Figure 3-2 Portable handle

 If the Analyzer needs to be moved after installation, the card compartment must first

be cleared, with no reagent cards left inside.  Do not put the instrument upside down during movement.  The movement needs to be smooth to prevent the center of gravity from leaning

3.7 Fixing removal

3.7.1 Tape removal

Remove the tape from the card compartment and the switch.

3.7.2 Removal of motion component fixing screws

After unpacking, place the instrument on the table according to the installation environment requirements, do not turn the instrument upside down. Move the instrument forward so that the two front feet are stuck to the edge of the table, the fixing screw holes at the bottom of the instrument are just exposed (be careful not to move the instrument forward too much, its center of gravity is too close to the edge of the table, in case the instrument fall off).

Figure 3-3 Fixing screw holes position

Installation

Loosen 1 x M4 x 30 hexagonal screw on the underside of the instrument from the round hole below and remove the screw. Take care to store the removed screw for next transport use.

3.8 Connecting instrument

This section introduces the connection of the instrument, including the connection of the power cord, power adapter, and the connection of the bar code scanner, and the installation of the waste card collection box and the printing paper.

3.8.1 Connection of the power cord and power adapter

Please connect the power cord and power adapter as follows: (1) Confirm that the power switch on the left panel of the instrument is in the OFF state; (2) Connect the power cord to the power adapter; (3) Insert the circular plug of the power adapter into the power interface on the back of

the instrument; (4) Insert the three-pin plug of the power cord into the power socket.

3.8.2 Connection of bar code scanner

An external bar code scanner can be connected to the instrument. It is recommended that users select or purchase a certified external 2D scanner (with CCC (S&E) compulsory certification) with a required USB interface. The applicable codes are one-dimensional barcode CODE128, CODE93, CODE39, CODEABAR, ITF, UPC, JAN, EAN and two-dimensional code QR Code. Please connect the barcode scanner as follows: (1) Insert the USB cable of the scanner into the USB port on the left panel of the instrument; (2) Press and hold the trigger button of the scanner, the light is activated, and the

illumination area and focus line appear. Align the focus line with the center of the barcode, move the scanner and adjust the distance between it and the barcode to find the best reading distance. When you hear a prompt sound and the focus line goes out, the barcode reading is successful.

External devices connected by the user should not cause the reduction of the safety and performance of the Analyzer.

3.8.3 Connection to external printer (user supplied)

The instrument supports external USB printers. USB protocol version is USB 2.0. Please connect the barcode scanner as follows: (1) Make sure the instrument and printer are turned off; (2) Plug one end of the printer USB cable into the printer USB port; (3) Plug one end of the printer USB cable into the USB socket on the left side of the

instrument; (4) Power on the instrument and printer, If the print icon in the instrument software

interface light up, it indicates the printer is connected successfully; (5) Go to “Manage” > “setup” > “Basic settings” > “Print Setup”, select “External

printer” in the printer type field, click “OK” to save the settings, and then you can use the external printer to print.

Installation

 External devices connected by the user should not cause the reduction of the safety

and performance of the Analyzer.  Recommended printer models: HP LaserJet P1008, HP LaserJet 1020 plus, HP LaserJet

3.8.4 Installation of waste card collection box

Please connect the waste card collection box as follows: (1) On the bench or desk where the instrument is positioned, please leave at least 200 mm

of space in front of the instrument to place the waste card collection box; (2) Place the waste card collection box close to the instrument, in front of the reagent card

compartment, parallel to the two sides of the reagent card compartment.

Figure 3-4 Installation of waste card collection box

3.8.5 Installation of printer paper

This section mainly introduces information about printer paper, paper roll installation and precautions. See the following table for information about printer paper.

Paper size Paper roll replacement method Paper cutting method

The device uses thermal printer paper with the width of 57±0.5 mm and external diameter ≤Ф30 mm.

Front change, easy loading paper roll structure Manually tearing

Please install the printer paper as follows: (1) Open the thermal printer cover gently. (2) Insert the paper roll into the paper slot with the shiny side inward, and leave a tail of

paper (about 2cm) sticking out (as shown in the figure below).

Installation

Figure 3-5 Installation of printer paper

(3) Close the printer cover.

The printer paper should not be in a loose state, otherwise it may cause the printer to stuck or blurred printing.

3.9 Start up

This section introduces login of the analyzer.

3.9.1 Before startup check

The instrument should be checked before startup each time to ensure that it is in good status.  Check the appearance of the instrument for any abnormalities, including whether the

reagent card cabin is closed, whether the card disposal slide is blocked, whether there is paper in the thermal printer and whether the printer cover is closed, etc.

 Check if the power cable and power adapter of the instrument are undamaged and correctly connected.

 Check if the waste card collection box is in place.

3.9.2 Login

(1) Turn the power switch of the device on the left panel to the “ON” position. The device

will start up and run initialization and self-test, and then enter into the login interface, as shown below:

Installation

Figure 3-6 Software login interface

(2) Input the user name and password of the service account. (User name: service; password: ask an after-sales engineer for details)

(3) Click “Log in” to go to the main interface. (4) After click “Auto login”, auto log in to current login account when the device is

started next time. (5) The device can be shut down by clicking the shutdown key in the top right of the login

This section describes the settings that need to be made to the analyzer software by the maintenance staff after installation, as listed below.

No. Item Remarks

1 Test settings Set up according to test-related requirements.

2 Print settings Set up according to the relevant requirements for printing report forms.

3 Hospital settings Set up according to hospital related information.

4 Communication setup Set up according to LIS requirements.

5 Language setting Set up language accordingly.

#### Installation

3.10.1 Test settings

Select “Manage” > “Settings”, the default interface is “Basic settings”. Click on “Test” to set the settings according to the hospital's requirements, as shown below.

Figure 3-7 Test settings interface

3.10.2 Print setup

Select “Manage” > “Settings”, the default interface is “Basic settings”. Click “Print Setup”, In this interface, users can set the report title, select the template type, paper, printing template, import/export/delete templates, set up printing copies, auto print, and print options according to the requirements of the hospital.

Installation

Figure 3-8 Print settings interface

3.10.3 Hospital settings

User can set up hospital-related information in this interface, including the hospital name, address, contact person and contact details. This screen shows the model, date of installation and serial number of the instrument by default. Users can set the contact person, contact details and notes for after-sales service, so that they can contact the after-sales service engineers for maintenance and repair of the instrument when needed.

Installation

Figure 3-9 Hospital settings

3.10.4 Communication setup

Select “Manage” > “Settings” > “System settings” > “Communication”, and enter the following interface to edit information related to the communication of the Analyzer. This interface is mainly for LIS connection settings.

Installation

Figure 3-10 Communication settings interface

3.10.5 Language setup

Select “Manage” > “Settings” > “System settings” > “Language setting”, and enter the following interface to set the language of the Analyzer. After the language is confirmed, the new language will take effect when restart.

Figure 3-11 Language Setup interface

#### Installation

3.11 Status confirmation

This section describes the status of the analyzer that needs to be confirmed by the maintenance personnel after installation, as described below.

3.11.1 Temperature confirmation

After the instrument has been switched on for 5 min, check whether the temperature display in the upper right-hand corner of the main software interface is stable within the range of 30°C ± 1.5°C.

Figure 3-12 Temperature icon interface

3.11.2 Card reading confirmation

Place the ID card close to the instrument's radio frequency identification area and click on “Read Card” to see if the reagent card information has been entered successfully.

Installation

Figure 3-13 Card reading interface

3.11.3 Motion confirmation

Click on “Motor self-test” to see if the status of the in-situ optocoupler has changed from blocked->unblocked->blocked and to see if the motor self-test is successful.

Figure 3-14 Self-test interface

#### Installation

3.11.4 Light source status confirmation

(1) Click on the instrument “Manage” > “Service” > “Maintenance” > “Optical

cal.”.  (2) Open the card compartment, place the reagent cards separately in channel 1 and close

the card compartment. (3) Click on “Position 1” to confirm that there is a signal value in the pre-built area of the

reaction curve, indicating that the light source can be switched on properly.

Figure 3-15 Light source status confirmation

3.11.5 QR code Scanning confirmation

(1) Click on the instrument “Manage” > “Service” > “Maintenance” > “Optical

cal.”. (2) Open the card compartment, place the reagent cards separately in 3 channels and

close the card compartment. (3) Click on “Scan QR” to see if the code is successfully scanned.

Installation

Figure 3-16 QR code Scanning confirmation Interface

3.11.6 Performance validation

QC card test (1) Click on “QC” > “QC settings” to enter the calibration curve information of the QC

card by scanning or reading the card.

Figure 3-17 QC card information input interface

(2) You can edit the name of the QC card as required in the pop-up box for new QC items.

Three positions

Installation

Figure 3-18 Add new QC item interface

(3) On the “QC test” interface, select “QC card” and in the “Control” drop down to select the name of the QC card you have just scanned or read.

Figure 3-19 QC test interface

(4) Place the QC cards into the card slots according to the applied positions for QC test and make sure the door of the channel is closed tightly.

(5) Click “Start” to start test.

Installation

Click on “L-J graph”, select the name of the QC card you have just scanned or read by scrolling down the drop-down list of “Control”, click on “Query” and check the quality control display dots. If the color of the quality control display dot is green, the quality control result is normal. If the color is red, the quality control result is abnormal.

Figure 3-20 “QC result” Query interface

Sample repeatability (1) Prepare three CRP test reagent cards and samples. (2) Click on “Multi” to enter the test interface, place the RFID card of the CRP reagent

card into the card reading area, click on the “Read card” button and input the reagent card information.

(3) If the sample is whole blood, the sample type is selected as “Whole blood” in all three positions, and if the sample is serum, the sample type is selected as “Serum” in all three positions.

(4) Select “Standard” test mode. (5) Add 5 µl of sample to 995 µl of diluent and mix thoroughly. Pipette 60 µl of the mixed

sample onto the reagent cards, again completing three cards in succession. (6) Place the three reagent cards, with mixed samples on them, into the accordingly

channels and close the cabin. Click “Start” to start the test. (7) After the test is completed, the repeatability of the three results is calculated and

should be no greater than 15%. Note: if other items need to be selected for reproducibility testing, the difference is only in the process of pipette mixed samples onto the reagent cards in step 5, which should be done by referring to the contents of the reagent card instructions. Once the test is complete, you can continue to confirm whether the print and return of reagent cards functions are working: (1) Click on the selection box where the results are located and click on the “Print”

button to print.

Installation

Figure 3-21 Print settings interface

(2) Ensure that the waste card box is in place, open the reagent card compartment door, and push the return toggle to drop the waste card into the recycling box.

Figure 3-22 Return of reagent card

3.12 Exporting logs

Logs can be exported as needed. Insert the USB drive into the USB port, click on “Manage” > “Service” > “Log” > “One-click export”, tick the items as shown and click “OK”.

Installation

Figure 3-23 Exporting logs

Debugging and calibration

4 Debugging and calibration

This chapter describes the Debugging and calibration of the instrument after troubleshooting such as repair or replacement of components.

4.1 Debugging

Module Repaired or replaced component

Items needing confirmation or debugging

The temperature controller

Heating plates, temperature sensors Temperature calibration

Optical component

LED Light source Light spot status confirmation, optical calibration

Optical PCBA Optical calibration

Entire optical module Light spot status confirmation, optical calibration

QR code Scanning component QR code Scanner QR code Scanning confirmation

#### RFID component RFID card reader Card reading confirmation

4.2 Temperature calibration

(1) As shown in the figure, click on the instrument “Manage” > “Service” >

“calibration” > “Temp. calibration” to enter the temperature calibration interface.

Debugging and calibration

Figure 4-1 Temperature calibration

(2) Once the temperature has stabilized, apply heat-conducting silicone grease to the temperature probe of the Fluke meter and press up against the aluminum block at channel 2 to test the temperature, fill in the measured temperature, and click “Start” to calibrate the temperature.

Figure 4-2 Temperature testing position

4.3 Light spot status confirmation

(1) Three channels: click on “Position 1”, “Position 2” and “Position 3” respectively.

/ Single channel: click on “Light spot”. (2) Observe from the side each time whether the light spot on the chromatography strip

hits a position in the middle of the strip. Click “ON” and observe the light spot pattern on the chromatography strip from the side. The normal light spot should be oval in shape and accompanied by a weak halo.

Debugging and calibration

Figure 4-3 light spot shape

(3) Three channels: click on “Position 1”, “Position 2” and “Position 3” respectively. / Single channel: click on “Light spot”.

(4) Observe from the side each time whether the light spot on the chromatography strip hits a position in the middle of the strip.

Figure 4-4 Confirm if the light spot is in the middle position of the strip

4.4 Optical calibration

(1) Place the fluorescent standard card into channel 1 and click on position 1 to scan. After

scanning, a curve will appear at the reaction curve position, and observe the horizontal coordinate position of the C-peak. Its horizontal coordinate should be between the two gray lines, and the horizontal coordinate position range is 400 to 470.

(2) In the optical calibration interface, check if the gain defaults to 1. If not, change it to 1 and click Save.

(3) Place the fluorescent standard card into channel 1 and click on position 1 to scan. (4) Click on the reaction curve area, observe the curve shape near the peak in the scanned

curve, increase the brightness. If the curve shape near the peak is flat, scan and observe again after decreasing the brightness by -1; if the curve shape near the peak is sharp, scan and observe again after increasing the brightness by +1. Repeat the above steps until the curve shape near the peak is flat, then decrease the brightness by -1 and click Save.

Figure a) Flat peak

Figure b) Sharp peak

(5) After the brightness adjustment is completed, then adjust the gain so that the original AD value of the peak point of the test of the fixed-value fluorescent standard card is between 5500000 and 6000000, and the AD value should be adjusted as large as possible within the allowed range, and the value displayed at the peak point in the coordinate system can be viewed by clicking on the area of the response curve graph.

Debugging and calibration

(6) As shown in the figure, observe the C-peak waveform, requiring left-right symmetry about its central axis.

Figure c) peak waveform symmetry illustration

4.5 QR code Scanning confirmation

Refer to section 3.11.5 QR code Scanning confirmation.

4.6 Card reading confirmation

Refer to 3.11.2 Card reading confirmation.

Maintenance

5 Maintenance

The Analyzer is a precision analytical device. In order to keep the it in good operating condition, obtain reliable test results and reduce the frequency of failure, maintenance and servicing of the instrument is required.

5.1 Maintenance requirements

Frequency Maintenance item Refer to

Daily Daily quality control of the Analyzer is required prior to sample test to ensure the reliability of the results.

Operation Manual

Monthly Inspect the external power cable every month for any signs of damage and ageing to ensure electrical safety. /

Every six months Inspect whether the instrument casing is fixed and whether the fixing screws are loose every six months. /

Perform screen calibration when the touch screen is unresponsive or inaccurate. 5.2

After the test is completed, clear the waste cards and clean the waste card recycling box in time. 5.3

The surface of the instrument and the surface of the card compartment need to be cleaned when there is contaminant to avoid possible biological contamination.

If the thermal printer run out of printing paper or have insufficient paper left, you need to replace the thermal paper before printing.

If the analyzer prompts other fault messages, please refer to the troubleshooting section of this manual to handle the operation accordingly.

 Please wear protective gloves during preventive maintenance and inspection to avoid

biohazards.  Do not clean the device with 84 disinfectant, or strong acid, strong alkali or other strong

solutions, otherwise it may cause corrosion of the surface and electronic components of the Analyzer.

#### Maintenance

5.2 Screen calibration

Click “Manage” > “Service” > “Maintenance” > “Monitor cal.” and confirm it. After the calibration starts, you can finish the screen calibration by clicking the targeting point on the screen each time according to the prompt (refer to the figure below).

Figure 5-1 Monitor calibration

5.3 Emptying, cleaning and disinfection of waste card collection

The waste card collection box can be reused, but it must be cleaned, sanitized, and disinfected after each day of use.  Before each testing, check if the waste card collection box. If it is, empty it timely to

prevent the waste cards from falling onto the bench or desk and cause biological contamination.

 Clean the waste card collection box by wiping it with 75% ethanol or 70% isopropyl alcohol and a cotton ball after all tests have been completed each day.

 Protective gloves must be worn to avoid biohazards when emptying, cleaning, and

disinfecting the waste card collection box.  Obsolete waste card collection boxes may still be biohazardous and should not be

disposed of indiscriminately. Please dispose of them in accordance with the relevant regulations.

5.4 Instrument cleaning

Clean the Analyzer by wiping its surface with water, 75% ethanol or 70% isopropyl alcohol and a cloth after all tests have been completed each day.

Maintenance

 Do not clean the device with any solvents, grease, or corrosive substances. If the user

has questions about the compatibility of the disinfectants or detergents with the device components or the materials contained in the device, please consult the after-sales service department of Zybio.

 Please wear protective gloves during cleaning and disinfection to avoid contact with samples left or dripped on the testing port of the instrument.

 Please power off the instrument and remove the power plug from the socket before cleaning and disinfecting it. Please take necessary measures to prevent liquids from entering the device during cleaning and disinfection, otherwise it may cause damage to the device or personal injury.

5.5 Printer paper replacement

When using the printing function, if the printer has run out of paper or if there is not enough paper left to print the testing report, the instrument will report a fault and the user will need to replace the paper and remove the fault manually. Please replace the printer paper as follows: (1) Open the thermal printer cover gently; (2) Take out the paper roll and the remaining paper; (3) Insert the paper roll into the paper slot with the shiny side inward, and leave a tail of

paper (about 2 cm) sticking out; (4) Close the printer cover; (5) Clear the fault manually as described in section “Troubleshooting”.

Please use thermal printer paper that meets the requirements, otherwise it may lead to problems such as printer failure, poor printing quality or print head damage.

Troubleshooting

6 Troubleshooting

This chapter introduces the errors and faults that may occur and the corresponding troubleshooting measures.

6.1 Fault code and warning mechanism

The possible faults of the Analyzer and the corresponding causes are outlined in the following table.

Fault code Fault name (User)

Description (Service personnel)

Warning mechanism

0x01000101 Incubation temperature sensor abnormal

Incubation temperature sensor abnormal

No data from temperature sensor. 1. Temperature sensor not

connected. 2. Temperature sensor failure.

Incubation temperature abnormal

Incubation temperature exceeded upper limit

Done with real-time testing, the acquired results from continuous 5s, a total of 5 points, were all above the target temperature of 10 ℃ (after calibration).

0x01000103 Incubation temperature exceeded lower limit

1. Start testing after heating for more than the maximum heating time (normal heating time +1min).

2. The acquired results from continuous 5s, a total of 5 points, were all below the target temperature of 10 ℃ (after calibration).
0x01000202 Error: driver board 5V voltage abnormal

Error: driver board  5V voltage abnormal

Driver board 5V voltage out of range \[4.50, 5.50\] V

0x01000401 System clock abnormal

Error: system clock abnormal

The system clock is earlier than January 1, 2000

0x01000501 Motor assembly failure

Error: Optical detection motor assembly failure

Optocoupler are still blocked after the motor moves beyond the optocoupler position.

Troubleshooting

Fault code Fault name (User)

Description (Service personnel)

Warning mechanism

0x01000502 The motor moves to the optocoupler position, moved all default steps, and the optocoupler is not blocked.

0x01000503 Abnormal number of remaining steps when motor triggers optocoupler.

0x01000504 Before the motor locate the optocoupler, the optocoupler status is abnormal.

0x01000505 While the motor is locating the optocoupler, false triggering of the optocoupler occurred.

0x01000506 Motor busy  (serious out-of -step)

0x01000507 Motor running time out

0x01000601 Thermal printer has run out of paper.

Thermal printer has run out of paper.

Thermal printer has run out of paper.

0x01000605 Error: thermal printer failure

Error: thermal printer failure

Error: thermal printer connection failure

0x01001501 External printer run out of paper.

External printer run out of paper.

External printer run out of paper.

0x01001502 Error: external printer failure

Error: external printer failure Other faults

0x01001503 External printer disconnected

External printer disconnected External printer disconnected

0x01001504 External printer paper jam

External printer paper jam External printer paper jam

Driver board communication abnormal

Error: driver board communication

MCU instruction analysis fault

0x01000702 MCU instruction parameter fault

0x01000703 MCU instruction: buffer overflows.

0x01000704 Driver board instruction has no response when timeout.

Troubleshooting

Fault code Fault name (User)

Description (Service personnel)

Warning mechanism

0x01000801 Error: optical detection board communication

Error: optical board communication

1. MCU instruction analysis fault

2. MCU instruction parameter fault

3. MCU instruction: buffer overflows.
0x01000802 Optical board instruction has no response when timeout.

0x01000901 Error: RFID card reader communication

Error: RFID card reader communication

Error: RFID card reader communication failure

0x01001001 Error: QR code scanner communication

Error: QR code scanner communication

Communication with the decoder fails when scanning the QR code during the test process.

0x01001101 Communication disconnected

Communication disconnected

The user turns on automatic communication. The LIS connection disconnected when communicating automatically.

0x01001102 Communication error

#### Communication error

1. Fault in communication (protocol analysis fault, or protocol field is not supported)

2. LIS response times out when ACK synchronization is enabled.
0x01001201 Expired reagent card Expired reagent card

The reagent card expiration date is earlier than the system time.

6.2 LIS connection failure

6.2.1 Fault code and warning mechanism

Fault code Description (User)

Description (Service personnel)

Warning mechanism

0x01001101 Communication disconnected

Communication disconnected

The user turns on automatic communication. The LIS connection disconnected when communicating automatically.

Troubleshooting

Fault code Description (User)

Description (Service personnel)

Warning mechanism

0x01001102 Communication error

#### Communication error

1. Fault in communication (protocol analysis fault, or protocol field is not supported)

2. LIS response times out when ACK synchronization is enabled.
6.2.2 Fault analysis and troubleshooting

When the LIS system fails to connect with the Analyzer, you can perform the following actions: (1) Check whether the network cable is connected between the computer side of the LIS

system and the instrument side. When the network cable is connected, the network port of the instrument will blink.

(2) Check whether the listening port of the LIS system and the instrument port are the same and whether the IP address of the LIS is correct. 1) LIS end port location: The listening port location is not consistent for different

LIS systems, please confirm according to the actual situation. 2) Instrument Port Location: Click in the main interface of the software “Manage” >

“Settings” > “System settings” > “LIS” to view the IP address and port number of LIS.

Figure 6-1 Check LIS port number

(3) Restart terminal Restarting the terminal can re-send connection commands to the LIS system. You can return to the main interface to check the LIS connection status after successfully restarting the terminal. Restart terminal: Click on the main screen of the

Troubleshooting

software “Manage” > “Settings” > “System settings” > “LIS” > “Restart terminal” to perform the restart terminal operation. After a successful restart of the terminal, a prompt will pop up.

Figure 6-2 Restart terminal

Figure 6-3 Restart terminal prompt

(4) If you perform the above actions and still cannot connect LIS successfully, turn off your computer's anti-virus software/firewall.

#### Troubleshooting

6.3 External printer failure

6.3.1 Fault code and warning mechanism

Fault code Description (User)

Description (Service personnel)

Warning mechanism

0x01001501 External printer run out of paper.

External printer run out of paper.

External printer run out of paper.

0x01001502 Error: external printer failure

Error: external printer failure Other faults

0x01001503 External printer disconnected

External printer disconnected

External printer disconnected

0x01001504 External printer paper jam

External printer paper jam

#### External printer paper jam

6.3.2 Fault analysis and troubleshooting

No. Possible cause Method Troubleshooting

1 Printer model not supported or printer quality problems.

Check the printer model and make sure the printer is fault-free.

Change to the printer that the Analyzer supports.

2 USB interface problems

The printer icon in the instrument interface is not lit; the fault is “External printer not connecting”.

Connect the printer to other USB ports to see if it works properly, and contact the R&D team for further confirmation.

3 External printer failure

The printer icon on the instrument interface is normal; no response when clicking “Print”.

1. Turn off the printer, disconnect the printer from the USB interface of the instrument.

2. Click “Print Setup” ＞ “Reset”, and restart the Analyzer one minute after the reset.

3. Plug in the printer USB after the Analyzer restarted, and then turn on the printer.
6.4 Temperature related failure

Incubation temperature sensor abnormal

Trigger condition MCU detects once a second. MCU communicates with a digital temperature sensor through the uni-bus. If no response, the sensor is abnormal.

Troubleshooting

Incubation temperature sensor abnormal

Trigger time MCU detects once a second.

System block diagram

Troubleshooting steps

Tool preparation When customer service encounters sensor abnormalities, it is recommended to prepare in advance the temperature sensor, driver board, multimeter, and screwdriver;

Incubation temperature exceeded upper limit

Trigger condition Done with real-time testing, the acquired results from continuous 5s, a total of 5 points, were all above the target temperature of 10 ℃ (after calibration).

#### Trigger time

1. Sampling rate ≥ 10 Hz 2. Real-time detection and alarm after power on. Alarm trigged if the results from the continuous collection of all 5 points exceed the limit. 3. Interface refresh rate: 2SPS

Troubleshooting

Incubation temperature exceeded upper limit

System block diagram

Troubleshooting steps

Tool preparation When customer service encounters sensor abnormalities, it is recommended to prepare in advance the temperature sensor, driver board, multimeter, and screwdriver;

Incubation temperature exceeded lower limit

Trigger condition

Start testing after heating for more than the maximum heating time (normal heating time + 1 min). The acquired results from continuous 5s, a total of 5 points, were all below the target temperature of 10 ℃ (after calibration).

Trigger time Start testing after heating for more than the maximum heating time (normal heating time +1min). Alarm trigged if the results from the continuous collection of all 5 points exceed the limit.

Troubleshooting

Incubation temperature exceeded lower limit

System block diagram

Troubleshooting steps

Tool preparation

When customer service encounters sensor abnormalities, it is recommended to prepare in advance the temperature sensor, driver board, multimeter, and screwdriver;

6.5 Communication fault

Error: QR code scanner communication abnormal

Trigger condition

Communication with the decoder fails when scanning the QR code during the test process.

Trigger time Detect when scanning the QR code.

Troubleshooting

Error: QR code scanner communication abnormal

System block diagram

 Administrator’s user name: admin  Administrator’s password: admin  Service personnel user name: service  Service personnel password: ask the after-sales engineer for details

The login password is case-sensitive.

7.2 Software interface introduction

Figure 7-1 Software interface introduction

No. Description

① Information display area: 1. Display temperature, logout, and shutdowns; 2. Display user name, LIS, WIFI, printing, battery level, system time.

② Auxiliary information area: When there is a fault in the instrument, the fault message is displayed here.

③ Function quick switch area: Single, Multi, Result, QC, and Manage.

④ ⑤ Navigation bar

7.3 Function list and authority category

No. First level function Second level Function Third level Function

3 Result / /

4 Quality control QC test /

No. First level function Second level Function Third level Function

QC result /

QC settings /

L-J graph /

5 Consumables /

Basic settings

Test settings (administrator, service engineer)

Print settings (administrator, service engineer)

Reference range settings (administrator, service engineer)

Hospital settings (administrator, service engineer)

Doctor settings (administrator, service engineer)

Department settings (administrator, service engineer)

Dictionary settings (administrator, service engineer)

Sample type settings (administrator, service engineer)

System settings

System time settings (administrator, service engineer)

Screen brightness settings (administrator, service engineer)

Auto sleep settings (administrator, service engineer)

Communication settings (administrator, service engineer)

LIS settings (administrator, service engineer)

Wi-Fi settings (administrator, service engineer)

Prompt settings (administrator, service engineer)

No. First level function Second level Function Third level Function

Language settings (service engineer)

User settings (administrator, service engineer)

Item settings (service engineer) /

Version Upgrade (Service personnel)

Motor-Optocoupler (administrator, service engineer)

RFID recognition (administrator, service engineer)

Monitor self-test (administrator, service engineer)

Light (administrator, service engineer)

Light spot confirmation (administrator, service engineer)

Maintenance

Monitor calibration (administrator, service engineer)

Optical calibration (Service personnel)

Temperature calibration (Service personnel)

Pack-shutdown (Service personnel)

All logs (administrator, service engineer)

Operation logs (administrator, service engineer)

Para. change logs (administrator, service engineer)

Fault logs (administrator, service engineer)

One-click export (Service personnel)

Clear logs (Service personnel)

No. First level function Second level Function Third level Function

5V Power supply voltage (administrator, service engineer)

Incubation temp. (administrator, service engineer)

System information (administrator, service engineer)

7.4 Settings

Users can set up the basic settings, system settings and user settings in this sub-module.

7.4.1 Basic settings

Select “Manage” > “Settings” > “Basic settings” and the following interface is displayed. You can set up relevant settings as needed.

Figure 7-2 Basic settings interface

 Test settings Click on “Test” to set the settings according to the hospital's requirements, as shown below.

Figure 7-3 Test settings interface

Users can perform settings of the samples, sample SN entry method, result display and CRP item. See the following table for details.

Parameters Explanations

Auto record submission time The start time of testing will be automatically regarded as the sampling time.

Auto record submission time The start time of testing will be automatically regarded as the test submission time.

Start No. Starting number for automatic incremental numbering of new samples

Next-day reset The following day the samples will be numbered incrementally from the new start No.

Show result edit mark Whether to display the “E” mark after the result is edited

Show result arrow mark Whether to display the “↑, ↓” mark if the test result is outside the reference range

Show detailed value Whether to display the detailed value of CRP test results

Show hs-CRP result Whether to display the hs-CRP result in the test results of CRP item

Rescan when failed The decoder rescans the QR code on the reagent card after it fails to recognize it.

 Print settings Refer to section 7.9 Printer Connection for printer connection procedures.

Click “Print Setup”, In this interface, users can set the report title, select the template type, paper, printing template, import/export/delete templates, set up printing copies, auto print, and print options according to the requirements of the hospital.

Figure 7-4 Print settings interface

 Reference range settings Click on the “Ref. range” button and the following screen will be displayed:

Figure 7-5 Reference range settings interface

In this interface, users can view the reference range for each test item, and add, edit, or delete reference groups.

 Hospital settings User can set up hospital-related information in this interface, including the hospital name, address, contact person and contact details. This screen shows the model, date of installation and serial number of the instrument by default. Users can set the contact person, contact details and notes for after-sales service, so that they can contact the after-sales service engineers for maintenance and repair of the instrument when needed.

 Doctor settings Click on the “Doctor” button to enter the doctor settings interface. Users can add new doctor, edit, or delete information about selected doctors, including the doctor's name, the department they work for, whether they are test submitters, testers, or reviewers, and add or modify the remarks.

 Department settings Click on the “Department” button to enter the department settings interface. Users can add new department, edit, or delete information about selected departments, including the name, person in charge and the remarks.

 Dictionary settings Click on the button to enter the dictionary settings interface which includes three parts: Clinical diagnosis, Patient type and Remark. Users can add, edit, or delete relevant information.

 Sample type settings Click on the “Sample type” button to enter the sample type settings interface where the sample types to be displayed and the default sample types are shown. Both include for types: whole blood, plasma, serum, and urine. Uses can choose the sample types according to actual testing needs.

7.4.2 System settings

In the “System settings” interface, users can change the settings of the system time, screen brightness, sleep, communication, LIS, WIFI and prompt. Select “Manage” > “Settings” > “System settings” to enter the following interface:

Figure 7-6 System settings interface

 System time Click on the “System time” button to enter the system time settings interface to set up the date, time, and date format of the Analyzer.

 Screen brightness The “Screen brightness” interface allows users to adjust the brightness of the Analyzer’s screen.

 Auto sleep Click on the “Auto sleep” button and the following screen will be displayed: In this interface, users can set auto sleep and automatic shutdown after a period of idling, for both adapter-powered and battery-powered instruments (only for instruments with batteries), respectively.

Figure 7-7 Auto sleep settings interface

 Communication Click on the “Communication” button and enter the following interface to edit information related to the communication of the Analyzer.

Figure 7-8 Communication settings interface

 LIS Click on the “LIS” button and enter into the following interface to set up the connection of the Analyzer to the LIS.

Figure 7-9 LIS settings interface

 Wi-Fi Click on the “WIFI” button to enter the WIFI settings interface. Users can set up the WIFI communication of the Analyzer.

 Prompt Click on the “Communication” button and enter the following interface to edit information related to the communication of the Analyzer. Note: “Display battery percentage” is only applicable to Analyzers equipped with battery.

Figure 7-10 Prompt settings interface

 Language The language can be switched via the drop-down box and takes effect after restarting the instrument.

Figure 7-11 Language setup interface

7.4.3 User settings

In the “User settings” interface, user roles and permissions can be set and differentiated to improve the security of the instrument. Select “Manage” > “Settings” > “User settings” to enter the following interface:

Figure 7-12 User settings interface

You can add, edit or delete users, and change or reset their passwords in this interface.

Select “Auto login”if you want to log into the operating software automatically (same

as that in the login interface).

7.5 Service

The “Service” sub-module contains four sections: Version, Self-test, Maintenance and Log.

7.5.1 Version

Select “Manage” > “Service” > “Version” to enter the version information interface where the software name, released software version, software model and device model are shown.

Figure 7-13 Version information interface

7.5.2 Self-test

Click on the “Self-test” tab to enter the following interface where users can perform self-test of all components so as to check their status and operational conditions.

Figure 7-14 Self-test interface

7.5.3 Maintenance

In the “Maintenance” interface, you can perform screen calibration, optical calibration, temperature calibration and packing shutdown operations.

Figure 7-15 Maintenance interface

Logs are used to record the usage of the Analyzer and are important for the user to check the usage history and for maintenance personnel to conduct troubleshooting. Click on the “Log” button and the following screen will be displayed:

Figure 7-16 log interface

The log includes all logs, operation logs, parameter change logs, and fault logs. All logs show all logs that the currently logged-in user can see, which are the sum of the logs described below; operation logs record the daily operation logs of the machine, including: power on, power off, login, logout, sample analysis, sample management, other important business operations, etc.; parameter modification logs show data of all major parameter modification categories, including various settings in setup items, system configuration changes caused by certain functions, and fault logs show fault-related logs, including fault reporting, fault troubleshooting, fault resetting, etc. All can be queried and exported.  Searching for logs

(1) Choose the type of logs need to enter the corresponding interface; (2) Input the range of date; (3) Click on the “Search” button and all logs within the date range will be shown.

 Exporting logs (1) Insert the USB flash drive (format FAT32) into the USB port; (2) Choose the type of logs need to enter the corresponding interface; (3) Click on the “Export” button to go to log exporting interface. (4) Select the type of log you want to export (current log or all logs) and click “OK”

to export the log(s).

7.6 Status interface

The “Status” sub-module includes two tabs: Monitoring and System information. Select “Manage” > “Status” > “Monitoring” to enter the following interface:

Figure 7-17 Status interface

7.6.1 Monitoring

Users can check the voltage and incubation temperature of the Analyzer in this interface.

7.6.2 System information

Users can check the information related to the disks of the Analyzer in this interface.

7.7 Status prompt

7.7.1 battery percentage

The battery icon can appear in eight states depending on how much power is available, with the icon mark for charging under adapter power, and the percentage display of power can be turned on or off in the settings. Shown as figure below:

Figure 7-18 battery status icon

 The percentage is displayed/not displayed to the right of the battery icon according to the setting in Prompt Settings - Power Percentage Display.

 During charging, the charging icon is displayed to the right of the battery icon or percentage.

7.7.2 Buzzer

The buzzer indicates the current status of the system. The buzzer’s status varies with the status of the instrument, as shown in the following table:

Condition Buzzer state

Test completed 3 beeps

Instrument failure Continuous beeping

 Tap on the touch screen to stop the beeping;  If a mouse is connected externally, click on the event with the mouse stops the beeping

7.8 Printer connection

7.8.1 Recommended printer models

 HP LaserJet P1008  HP LaserJet 1020 plus  HP LaserJet Pro M12a

7.8.2 Print setup

 Click “Manage” > “Settings” > “Basic Settings” > “Print” to enter the print

settings interface.  You can select “Thermal printer” (default) or “External printer” for printing as

required.  Select the print paper type required by the hospital.  Select a print template.  Other auxiliary functions can be set as needed, usually the default is sufficient and no

additional settings are required.

Figure 7-19 Print setup interface

7.8.3 Connect External printer

(1) Select a printer and plug it into the analyzer USB port. (2) The printer is plugged in and powered on. (3) The icon will light up when the connection is successfully marked, and the icon can

also be clicked to view print tasks.

7.8.4 Print the report

Go to the “Result” interface, select the samples to be printed, click “Review” (can be turned off at print settings), and then click “Print”.

7.8.5 Troubleshooting

 If the printer in same model has the problem in recognizing, you can restore by “Reset”

button.  If a malfunction occurs during connection or printing, it can be handled by the

“External Printer Troubleshooting Method”.

7.9 Upgrade

7.9.1 Preparation

Copy “update\_Q3.tar.gz” to the root directory of the formatted USB drive.

 The USB drive has been formatted into FAT32 format.  The USB flash drive has enough storage left.  The root directory of the USB drive contains only the file “update\_Q3.tar.gz”. Change

of file name is prohibited. No unzipping is required.

7.9.2 Steps

(1) Insert the USB flash drive into the USB port of the Analyzer; (2) Login with service personnel user name; (3) Click “Manage” > “Status” > “Version”, enter the version interface, and click

“Upgrade”; (4) After entering the upgrade interface, select the programs that need to be upgraded (by

default, all programs that support upgrade are selected) and click “Update” to start the upgrade.

7.9.3 Upgrade status verification

After the upgrade is completed, restart the instrument, log in with your service personnel user name, enter “Manage” > “Status” > “Version”, check whether the software information version number is the upgrade version number, if it is the same, then the upgrade is successful.

7.9.4 Upgrade process abnormal handling

If the upgrade prompt fails, you can try to upgrade again.

Hardware system

8 Hardware system

8.1 About hardware System

This chapter describes the hardware subsystems of the Fluorescence Immunochromatography Analyzer.

8.2 Hardware system composition

The hardware subsystem of the fluorescence immunochromatography analyzer can be divided into power subsystem, human-computer interaction subsystem, temperature control subsystem, reagent containment subsystem, motion control subsystem, and measurement subsystem according to the functional modules, and its schematic block diagram is shown below:

Figure 8-1 Hardware system diagram

Hardware system

#### The power subsystem diagram is shown in the following figure:

Figure 8-2 Hardware system-power subsystem diagram

8.2.1 Hardware subsystem components of the complete

machine accessories The list of the components of the complete hardware subsystem of the Fluorescence Immunochromatography Analyzer is shown in the following table.

No. Name Description

1  Master control board It acts as the brain of the system in the hardware subsystem and is responsible for the control unit and human-machine interface for the operation of the complete machine.

2  Driver board In the hardware subsystem, it is the driver for motors, heating, and system power topology, etc.

3  Adapter board /

4  Optical PCBA Optical signal acquisition

5  Lithium battery charging pad Lithium battery charging

6  RFID card reader /

7  8 inch capacitive screen module /

8  QR code Scanner /

9  Outsourced leaded NTC resistors /

10  Rechargeable lithium battery pack /

Hardware system

No. Name Description

11  Thermal printer Zybio grey1 /

12  Thermal printer Zybio grey2 /

13  DC power adapter /

14  Outsourced terminal UV LED lamp aluminum substrate /

15  SWITCH /

16  4G antenna /

17  Wi-Fi antenna /

18  Magnetic ring /

19  Outsourced terminal OPB880P51Z optocoupler /

20  SZ18 driver board outsourced temperature sensor /

21  Heating disk /

#### Hardware system

8.2.2 PCBA card layout for the hardware subsystem

Figure 8-3 PCBA cards diagram

No. Description

1 RFID card reader

2 Master control board

3 driver board

4 Lithium battery charging board

5 Optical board

6 Adapter board

#### Hardware system

8.3 Functions of the circuit board

8.3.1 Master control board

Shown in the figure below is the diagram of the main control board of the Analyzer. It works as the control unit of the complete machine to control its operation and testing. The main control board is mainly composed of USB interfaces, a 100 Gigabit network PHY interface, a CPU minimum system, a thermal printer, Wi-Fi, DTU, human-computer interaction, and other interface circuits.

Figure 8-4 Master control board principle diagram

#### The symbols on it are shown in the following figure:

Figure 8-5 Master control board symbols

Hardware system

#### Connection port interface definition description:

J8 main control board DTU module interface definition description

Terminal number Definition Description

J8.1 DP2 DTU module communication signal

J8.3 VDD\_USB DTU module power supply

J12 main control board driver board communication port definition description

Terminal number Definition Description

J12.1 DGND /

J12.2 DGND /

J12.3 DGND /

J12.4 MCU\_Usart1\_RX The communication signal of the main control board and the driver board J12.5 MCU\_Usart1\_TX

J12.6 DGND /

J12.7 MCU\_Usart3\_RX The communication signal of the main control board and the driver board J12.8 MCU\_Usart3\_TX

J12.9 DGND /

J12.10 RS232\_CPU\_RX8 Bar code scanner communication signal

J12.11 RS232\_CPU\_TX8

J12.12 DGND /

J12.13 DGND /

J12.14 DP3 USB3

J12.16 DGND /

Hardware system

J12 main control board driver board communication port definition description

J12.17 DP4 USB4

J12.19 DGND /

J12.20 LED0\_PHYAD0 Network port indicator light

J12.21 LED1\_PHYAD1

J12.22 DGND /

J12.23 RMII\_RX\_N NET Differential Signal Line

J12.24 RMII\_RX\_P

J12.25 DGND /

J12.26 RMII\_TX\_N NET Differential Signal Line

J12.27 RMII\_TX\_P

J12.28 DGND /

J12.29 DGND /

J12.30 DGND /

J1 main control board power supply port definition description

Terminal number Definition Description

J1.1 DGND /

J1.2 VDD8V\_P /

J1.3 DGND /

J1.4 VDD5V\_P /

J1.5 DGND /

J5 main control board thermal printer port definition description

Terminal number Definition Description

J5.1 VDD8V\_P Thermal printer power supply

Hardware system

J5 main control board thermal printer port definition description

J5.3 RS232\_CPU\_TX5 Thermal printer communication signal

J5.4 RS232\_CPU\_RX5

J5.5 DGND /

J6 main control board serial debug interface definition description

Terminal number Definition Description

232 debug serial port J6.2 DGND

J6.3 RS232\_CPU\_TX1

J6.4 RS232\_CPU\_RX1

J2 master control board USB download interface definition description

Terminal number Definition Description

J2.1 CPU\_USB\_VBUS1

USB download interface

J2.3 CPU\_DM1

J2.4 CPU\_DP1

J2.5 CPU\_USB\_OTG1\_ID

J13 main control board reserved interface definition description

Terminal number Definition Description

Reserved interface

Hardware system

J14 main control board touch screen interface definition description

Terminal number Definition Description

J14.1 VDD3V3

Touch screen interface

J14.2 CPU\_TP\_INT

J14.3 CPU\_IIC2\_SDA

J14.4 CPU\_IIC2\_SCL

J14.5 CPU\_TP\_RST

J11 main control board touch screen interface definition description

Terminal number Definition Description

J11.50 LCD\_LED+

Touch screen interface

J11.49 LCD\_LED+

J11.48 LCD\_LED-

J11.47 LCD\_LED-

J11.46 DGND

J11.45 LCD\_VCOM

J11.44 LCD\_VDD

J11.43 LCD\_MODE

J11.42 LCD\_DE

J11.41 LCD\_VSYNC

J11.40 LCD\_HSYNC

J11.39 LCD\_DATA7

J11.38 LCD\_DATA6

J11.37 LCD\_DATA5

J11.36 LCD\_DATA4

J11.35 LCD\_DATA3

J11.34 LCD\_DATA2

Hardware system

J11 main control board touch screen interface definition description

J11.33 LCD\_DATA1

J11.32 LCD\_DATA0

J11.31 LCD\_DATA15

J11.30 LCD\_DATA14

J11.29 LCD\_DATA13

J11.28 LCD\_DATA12

J11.27 LCD\_DATA11

J11.26 LCD\_DATA10

J11.25 LCD\_DATA9

J11.24 LCD\_DATA8

J11.23 LCD\_DATA23

J11.22 LCD\_DATA22

J11.21 LCD\_DATA21

J11.20 LCD\_DATA20

J11.19 LCD\_DATA19

J11.18 LCD\_DATA18

J11.17 LCD\_DATA17

J11.16 LCD\_DATA16

J11.15 DGND

J11.14 LCD\_PCLK

J11.13 DGND

J11.12 LCD\_L/R

J11.11 LCD\_U/D

J11.10 LCD\_VGH

J11.9 LCD\_VGL

J11.8 LCD\_AVDD

J11.7 LCD\_RST

Hardware system

J11 main control board touch screen interface definition description

J11.5 LCD\_VCOM

J11.4 LCD\_DITHB

J15 master control board RFID interface definition description

Terminal number Definition Description

RFID interface J15.2 RS232\_CPU\_RX7

J15.3 RS232\_CPU\_TX7

J15.4 VDD5V

J9 master control board Wi-Fi antenna interface definition description

Terminal number Definition Description

Wi-Fi antenna interface

J12 main control board driver board communication port definition description

Terminal number Definition Description

J17.30 DGND /

J17.29 DGND /

J17.28 DGND /

Hardware system

J17.27 MCU\_Usart1\_RX The communication signal of the main control board and the driver board J17.26 MCU\_Usart1\_TX

J17.25 DGND /

J17.24 MCU\_Usart3\_RX The communication signal of the main control board and the driver board J17.23 MCU\_Usart3\_TX

J17.22 DGND /

J17.21 RS232\_CPU\_RX8 Bar code scanner communication signal

J17.20 RS232\_CPU\_TX8

J17.19 DGND /

J17.18 DGND /

J17.17 DP3 USB3

J17.15 DGND /

J17.14 DP4 USB4

J17.12 DGND /

J17.11 LED0\_PHYAD0 Network port indicator light

J17.10 LED1\_PHYAD1

J17.9 DGND /

J17.8 RMII\_RX\_N NET Differential Signal Line

J17.7 RMII\_RX\_P

J17.6 DGND /

J17.5 RMII\_TX\_N NET Differential Signal Line

J17.4 RMII\_TX\_P

J17.3 DGND /

J17.2 DGND /

J17.1 DGND /

#### Hardware system

8.3.2 Driver board

Shown in the figure below is the diagram of the main control board of the Analyzer. It works as the control unit of the complete machine. The driver board is mainly composed of a stepper motor driver, UV lamp driver, fan driver, heating driver, temperature detection, optocoupler detection, connector adapter, and other interface circuits.

Figure 8-6 Driver board principle diagram

#### The symbols on it are shown in the following figure:

Figure 8-7 Driver board symbols

#### Plugin interface definition description:

Hardware system

J25 driver board power switch interface definition description

Terminal number Definition Description

J25.1 Push Button

Power switch interface J25.2 GND

J1 Driver board adapter interface definition description

Terminal number Definition Description

J1.1 VDD\_24V

Adapter power input J1.2 GND

J6 Driver board and lithium battery charging board interface definition description

Terminal number Definition Description

J6.1 VDD\_24V Driver board output to Li-ion battery board

J6.3 VDD24V\_IN Lithium battery board output to driver board

J29 driver board and lithium battery board communication interface definition description

Terminal number Definition Description

J29.1 BAT\_PG

Driver board and lithium battery board communication interface

J29.2 BAT\_STAT1

J29.3 BAT\_STAT2

J29.4 BAT\_SCL

J29.6 BAT\_SDA

Hardware system

J9 driver board reserved fan interface definition instructions

Terminal number Definition Description

J9.1 VDD\_12V

Reserved fan interface J9.2 FAN\_FG

J9.3 DrvFAN

J8 driver board stepper motor interface definition description

Terminal number Definition Description

J8.1 Motor\_AOUT1

stepper motor interface J8.2 Motor\_AOUT2

J8.3 Motor\_BOUT1

J8.4 Motor\_BOUT2

J11 Driver board heating interface definition description

Terminal number Definition Description

J11.1 VDD\_12V Driver board heating interface

J11.2 Drv\_Heat1

J15 Driver board temperature detection interface definition description

Terminal number Definition Description

J15.1 VDD3V3\_SYS

Detection wire connection port J15.2 MCU\_DS18B20\_1

J12 driver board debug serial port interface definition instructions

Terminal number Definition Description

J12.1 RS232\_MCU\_TX2 Driver board debug serial port interface definition instructions J12.2 RS232\_MCU\_RX2

Hardware system

J12 driver board debug serial port interface definition instructions

J18 Driver board and adapter board interface definition description

Terminal number Definition Description

J18.1 Light\_VR\_CS

Driver board and adapter board interface J18.2 VCC5V

J18.4 VCC-5V

J18.5 Light\_SPI2\_CLK

J18.8 VDD5V\_SYS

J18.9 Light\_SPI2\_MOSI

J18.11 Light\_SPI2\_MISO

J18.12 VDD3V3\_SYS

J18.13 Light\_N\_DRDY

J18.14 RS232\_UART\_TX8

J18.15 Light\_SPI2\_CS

J18.16 RS232\_UART\_RX8

J18.17 Light\_ADC\_RST

Hardware system

J2 driver board reserved interface definition instructions

Terminal number Definition Description

Driver board reserved interface definition instructions J2.2 /

J10 Driver board optocoupler interface definition description

Terminal number Definition Description

J10.1 SENSOR1

Driver board optocoupler interface J10.2 GND

J10.3 SENSOR\_LED1

J14 driver board USB interface definition description

Terminal number Definition Description

J14.1 VBUS\_USB

USB interface 1 J14.2 DM3

J14.5 VBUS\_USB

USB interface 2 J14.6 DM4

Hardware system

J13 driver board USB interface definition description

Terminal number Definition Description

J13.1 RMII\_TX\_P

J13.2 RMII\_TX\_N

J13.3 RMII\_RX\_P

J13.4 TD\_CT

J13.5 RD\_CT

J13.6 RMII\_RX\_N

J13.9 GREEN\_LED+

J13.10 GREEN\_LED-

J13.11 YELLOW\_LED-

J13.12 YELLOW\_LED+

8.3.3 Optical detection board

The following figure shows the principle diagram of the optical detection board of the Fluorescence Immunochromatography Analyzer. Its optical detection board converts the detected fluorescence signal to a digital signal and uploads it.

Figure 8-8 Optical detection PCBA principle diagram

#### Its PCB symbol is shown in the following figure:

Hardware system

Figure 8-9 Optical detection PCBA symbols

#### Plugin interface definition description:

J1 optical detection board and adapter board interface definition description

Terminal number Definition Description

Optical detection board and adapter board interface

J1.2 Light\_SPI2\_MISO

J1.4 Light\_SPI2\_MOSI

J1.6 Light\_SPI2\_CLK

J1.8 Light\_VR\_CS

J1.10 Light\_N\_DRDY

J1.11 Light\_SPI2\_CS

J1.12 Light\_ADC\_RST

J1.14 VDD3V3\_SYS

J1.15 VDD5V\_SYS

Hardware system

J1 optical detection board and adapter board interface definition description

J1.17 RS232\_UART\_TX8

J1.18 RS232\_UART\_RX8

J1.24 VCC5V

J1.25 VCC-5V

J2 optical detection board UV lamp interface definition instructions

Terminal number Definition Description

J2.1 VDD5V\_SYS

Optical board barcode reader interface J2.2 UVRS232\_UART\_RX8

J2.3 RS232\_UART\_TX8

J3 optical detection board UV lamp interface definition instructions

Terminal number Definition Description

J3.1 UV- Optical detection board UV lamp interface definition instructions  J3.2 UV+

8.3.4 Lithium battery charging pad

The following diagram shows the principle diagram of the Analyzer’s lithium battery charging board, which can manage the charge and discharge of rechargeable lithium batteries.

Hardware system

Figure 8-10 Lithium battery charging pad principle diagram

#### Its PCB symbol is shown in the following figure:

Figure 8-11 Lithium battery charging pad symbols

#### Plugin interface definition description:

J1 Driver board and lithium battery charging board interface definition description

Terminal number Definition Description

J1.1 VDD\_24V\_IN Driver board output to Li-ion battery board

J1.3 VDD\_SYS Lithium battery board output to driver board

Hardware system

J2 Driver board and lithium battery charging board interface definition description

Terminal number Definition Description

Driver board and lithium battery charging board interface

J2.2 BAT\_SCL

J2.3 BAT\_SDA

J2.4 BAT\_NTC

J3 Driver board and lithium battery charging board interface definition description

Terminal number Definition Description

Driver board and lithium battery charging board interface

J2.2 BAT\_SCL

J2.3 BAT\_SDA

J2.4 BAT\_NTC

J4 lithium battery charging board temperature detection interface

Terminal number Definition Description

Lithium battery charging board temperature detection interface

J4.3 BAT\_TS

#### Hardware system

8.4 Indicator light status of the PCBAs:

Name Normal operation indicator status

Master control board

Voltage status indication  LED8 (8V) does not light up while start-up and is always on

after start-up is completed;  LED9(5V) light always on when start-up;  LED10(3V3) light always on when start-up.  Core board

Red light is always on, blue light flashes once a second.

Driver board

 LED8 (12V), LED9 (8V), LED10 (5V) always on when start-up (voltage status indication);

 LED1 blinks once in 200 ms when starting and once per second when started (MCU working status indicator).

Lithium battery charging pad

 LED1 always on when connected to the adapter, LED2 on when charging;

 LED1/ LED2 does not light up when not connected to the adapter.

Figure 8-12 Master control board indicator light

Hardware system

Figure 8-13 Driver board indicator light

Figure 8-14 Battery board indicator light

Mechanical system

9 Mechanical system

9.1 About mechanical system

The complete structure of the Analyzer is mainly composed of the following parts: top shell assembly, middle shell, bottom shell assembly, bottom board assembly, card compartment assembly, hardware boards, wires, etc.

9.2 Appearance:

The front view of the Analyzer is as shown in the figure below.

Figure 9-1 Front view

#### Parts breakdown:

1 Bottom panel assembly

2 Middle panel assembly

3 Top panel assembly

4 Monitor assembly

5 Card compartment exterior dressing part-EXR120

Mechanical system

The back view of the Analyzer is as shown in the figure below.

Figure 9-2 Back view

#### Parts breakdown:

1 Power interface

The left view of the Analyzer is as shown in the figure below.

Figure 9-3 Left view

#### Parts breakdown:

1 Network interface

3 USB interface

The top view of the Analyzer is as shown in the figure below.

Mechanical system

Figure 9-4 Top view

#### Parts breakdown:

1 Card compartment assembly

The bottom view of the Analyzer is as shown in the figure below.

Figure 9-5 Bottom view

Mechanical system

#### Parts breakdown:

No. Name Quantity Remarks

2 Knurled hexagon socket cheese head screws 1 Remove after opening the box

3 Top shell fixing screws 4 Remove when dismantle top panel

9.3 Mechanical component structure

9.3.1 Top panel assembly

Figure 9-6 Exploded view of the instrument housing

#### Parts breakdown:

No. Accessories name

1  Top panel assembly

2  Screen plate

3  RFID card reader

4  Wi-Fi module antenna

5  Thermal printer

6  Master control board

7  8 inch capacitive touch screen module

#### Mechanical system

9.3.2 Bottom panel assembly

Figure 9-7 Bottom panel assembly

#### Parts breakdown:

No. Accessories name

1 Card compartment assembly

2 Bottom panel assembly

3 Driver board

4 Top panel connection bar

5 Rechargeable lithium battery pack

6 Lithium battery charging pad

7 Bottom panel assembly

#### Mechanical system

9.3.3 Bottom panel assembly

Figure 9-8 Bottom panel assembly

#### Parts breakdown:

No. Accessories name

1 Motion component mounting base plate

2 Linear guide

3 Linear guide

4 Synchronous belt

5 42 stepper motor

6 adapter board

7 QR code scanner

9 Optical PCBA

10 Outsourced terminal UV LED lamp aluminum substrate

11 Ball plunger

#### Mechanical system

9.3.4 Card compartment assembly

Figure 9-9 Explosion diagram of the card compartment assembly

#### Parts breakdown:

No. Accessories name

1 card compartment

2 Temperature control component motion guide block

3 Temperature control component mounting plate

4 Incubation module heating plate

5 Heater insulation foam

6 Movement damping plate of the card compartment assembly

7 Temperature protection switch

8 Digital temperature sensor

9 Ceramic heating plate

10 Ceramic heating plate fixing adhesive layer

11 Temperature control assembly reset spring

#### Mechanical system

9.3.5 Top panel removal

(1) Unscrew four M3\*8 socket head cap screws from bottom to top.

(2) Hold the handle of the instrument and turn it counterclockwise on the axis of the front

of the top panel.

(3) Remove the upper case and place it in the following way, taking care not to tilt the top

panel too much and pull the SZ18 main control board power input line and connection line of SZ18 main control board and driver FPC during the process.

#### Mechanical system

9.3.6 Coin cell battery disassembly (mainly for customs

inspection) (1) After removing the top panel in accordance with section 9.3.5 above, you can observe

the coin cell battery on the main control board in the following position.

(2) The coin cell battery can be removed by toggling the lateral tab outward.

#### Mechanical system

9.3.7 Middle panel removal

(1) Unplug the main control board power input cable and the main control board-driver

FPC connection cable from the main control board.

(2) Pull out the card compartment in order to unscrew the fixing screw of the middle panel.

(3) Unplug the J25 port switch connection cable.

Mechanical system

(4) Make sure you have pulled out the card compartment. Remove the middle panel by

moving the optical assembly to the center and then lifting the middle panel.

Optical system

10 Optical system

This chapter introduces the information about the optical system, including the principle and composition of the optical system, identification of the optical system status, maintenance of optical system, and replacement of the optical system.

10.1 Principle of optical system

After antigen and antibody reactions are generated in the detection and quality control line areas of the reagent card, microsphere-antibody-antigen-antibody sandwich complexes are formed and immobilized, and detected by scanning the detection area with excitation light, and fluorescent nanospheres emit fluorescence on the detection and quality control lines. The concentration of the substance to be measured in the sample can be analyzed by detecting the fluorescence emitted by the photodetector.

#### Figure Basic principle of optical system

10.2 Optical system structure

This section presents information related to the composition of the optical system, including a general introduction and an introduction to the core components.

10.2.1 General introduction

The optical system mainly includes light source driver and signal acquisition board, sealing foam pad, lens set module, and LED light source.

Optical system

#### Figure Optical component structure

10.2.2 Introduction to the optical path of optical systems

The optical path in the optical system is shown as follows. The UV LED lamp emits UV light, which is shaped by the lens and diaphragm, and is reflected and focused on the test strip by the two-way beam splitter to excite fluorescence, and the red fluorescence is focused on the PD through the two-way beam splitter by the lens to collect the fluorescence signal.

#### Diagram of the internal optical path of the lens assembly

10.3 Optical system maintenance and replacement

This section describes how to maintain and replace the optical system.

10.3.1 Precautions

 When touching the optical components in an emergency, touch the analyzer's door or

metal grounding object with your hand to draw the static electricity away from your body.

 Do not use bare hands to directly touch the optical components, detector light-sensitive surface.

 The whole process should be careful of dust, oil and fingerprints contaminating the optics and PD photosensitive surface.

Optical system

 When opening the instrument housing for optical system testing, the optical system should be shaded to prevent ambient glare from hitting the detector within the optical system.

 It is strictly prohibited to unplug the power cord of LED light source under charged

condition.  Be aware of UV radiation and do not look directly into the beam at any moment.

10.3.2 Optical system maintenance

10.3.2.1 LED maintenance

(1) Check the internal wiring of optical system and if the laser path is blocked by wires; (2) Check if the light source driver board is normal. (3) If the light source driver board is confirmed to be damaged, the laser driver board

can be replaced separately. (4) If you confirm that the light source driver board is intact, and the LED light source

does not light, you can replace the LED light source alone. At the same time, the light source brightness and gain need to be calibrated a second time.

10.3.2.2 Lens maintenance

If the light spot morphology confirmation result is abnormal spot, the lens inside the lens assembly may be contaminated, use a dust-free cloth with anhydrous alcohol to gently wipe them. The method of wiping is: wipe from the center of the lens spiral outward (not recommended, the more you wipe, the greater the possibility of making it dirtier).

10.3.3 Replacement of optical system assembly

10.3.3.1 Replace the LED light source

If the UV LED light source is determined to be faulty, it can be replaced. First, power off the instrument, then disassemble the top panel and the middle panel, cut the light source wire fixing tie, unplug the UV light source power supply interface J3, and use the hexagonal screwdriver to remove the LED light source from the module to replace it. You need to perform optical recalibration after replacing the light source.

a) light source

#### Optical system

10.3.3.2 Replace the light source driver and signal acquisition

If it is confirmed that the light source driver and signal acquisition board is faulty, it can be replaced. First, disconnect the instrument's power supply, open the top panel, take off the three M3 \* 8 hexagonal combination of screws that fix the guard plate installed on the bottom, and then unplug all the interfaces on the board, and then unscrew the board and cable holding plate fixing screws, unplug the adapter plate and the optical board FPC connection cable on the board, replace the corresponding circuit board. Wear plastic gloves during the replacement process to prevent fingerprints, dirt pollute PD detection surface, if the board is removed after a long period of time without operation, the optical module detection light outlet should be covered with black tape or paper to prevent dust contamination of the lens. The light source driver and signal acquisition board should be rechecked or calibrated after replacement.

a) Wire guard fixing screw

b) Adapter board and optical board FPC connection cable

10.3.3.3 Replace the entire optical assembly

If it is confirmed that the optical lens set has failed, the entire optical assembly needs to be removed. First, disconnect the instrument's power supply, open the top panel, take off the three M3 \* 8 hexagonal combination of screws that fix the Wire guard installed on the bottom, and then unscrew the board and wire plate fixing screws, unplug the adapter plate and the optical board FPC connection cable on the board. The optical module assembly can be removed by unscrewing the hexagonal screw that connects the optical assembly to the slide rail and synchronous belt. You can first gently shake the optical components to see if the internal lens is fixed properly. If there is a shaking sound, you can remove the circuit board and light source to fix screws with a flat-blade screwdriver. If there is no shaking sound, the cause needs further analysis. After replacing the entire optical assembly, the Analyzer needs to perform optical calibration.

Optical system

a) Fixing screws

b) Fixing screws

Appendix Complete machine wiring diagram

Appendix Complete machine wiring

