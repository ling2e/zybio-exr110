# POCT Optical System Calibration Operation Guide.pdf

POCT Optical System Calibration Operation Guide

1 Description

The debugging scheme only adjusts the gain of the instrument, and

is mainly used for detecting the fluorescence emitted by the fluorescent

substance of the fluorescent microsphere; and after the fluorescence is

filtered and reflected, the intensity of the light of the fluorescent

microsphere is detected, and then is converted into a digital signal to be

2 Preparation before commissioning

It is necessary to prepare the assigned four-line QC card in advance

(the card is specially made, and the signal values of C, T1, T2 and T3 are

generally displayed in gradient)

Log in to the instrument with an administrator account or an

engineer account（EXR、Q8pro）。

This is a 4-line QC card

The Target value is written on the back

This is a high-value test card.

3 Debug the Q8pro 3.1

Log in with the administrator account or engineer account and

enter: "Maintenance" -- "Single Step Command" -- "Optical Module" --

"Card Insertion"

Insert the four-line QC card into the test hole and click "Scan".

After the scan test, the signal value of the four-line QC card will be

displayed on the reaction curve (as shown in the figure below).

Calculate the Bias of the test values of C, T1, T2, T3 from the

target value (yellow area), and the required range of deviation (±3%)

Bias=Test value/Target value-1

4-line QC card

Test values,Please record these 4 values

If Bias does not meet the (± 3%) requirement, click "Light

Source" to enter and adjust the

gain value.

The modification is to decrease the value of the gain if Bias is

positive. If Bias is negative, the value of the gain is increased. "Save"

after modification

After storage, repeat the above steps, use the four-line QC card

to test again, and calculate Bias with the target value of the quality

control card again until Bias meets (± 3%). The gain adjustment

depends on the bias. Try several times until the bias is less than 3%.

4 Debug the EXR 4.1Log

in with an administrator account or engineer account：

“Manage”--“Service”--”Maintenance”--“Optical calibration”

Put the 4-line QC card into the card compartment "position 1",

click "position 1", and after scanning and testing, the signal value of the

4-line QC card will be displayed on the reaction curve (as shown below).

EXR is different from Q8pro. EXR needs to detect each position once, a

total of three positions

4.3Calculate

the Bias of the test values of C, T1, T2, and T3 from the

target value (yellow area), and the required range of Bias (±3%)

Tip: The value on the interface is the original signal value. Before calculation, you need to

divide the original signal value by 10000 and substitute it into the formula. , The test value = the

original signal value/10000, and the number after the decimal point of the actual signal value can

be ignored.

The test value = The original signal value/10000

Bias=The test value/target value -1

Use the same 4-line QC card to confirm the "position 2" and

These are original signal

All three positions need to be tested

"position 3" position respectively. If the (± 3%) requirement is not met,

the value of

Current Gain

needs to be modified.

The modification is to

the value of the gain if Bias is

the value of the gain is

after modification

After storage, repeat the above steps, use the four-line QC card

to test again, and calculate Bias with the target value of the quality

control card again until Bias meets (± 3%).

#### Example on EXR:

#### Check the target value on the back of the four-lines card:

#### We can see, target value are like this:

Testing 4-lines Cards on EXR

The following are the original signal values of the three positions in

the first test:

#### From the above interface we can get the original signal value:

On EXR, The test value=the original signal values/10000

#### Calculate the bias of the test value from the target value:

The absolute value of the bias in the yellow area are > 3%, which

does not meet the requirements and needs to be adjust Current gain.

Beacause -5% ＜ 0 ， -4% ＜ 0.They are all negative, so we need to

increase the Current gain. Because the absolute values of 4% and 5% are

close to 3%, it is only increased by 1. The original Current gain is 13, and

now it is adjusted to 14. (If the bias is large, you can adjust 3~5 based on

the original.)

After clicking “Save”, test again with the 4-lines card.Get the

original signal value in the following interface.

#### Like the above steps, calculate Bias:

All biases were less than 3% in absolute value, calibration is

