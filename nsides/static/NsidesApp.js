// nSides App, Updated July 2017

// Copyright (C) 2017, Tatonetti Lab
// Tal Lorberbaum <tal.lorberbaum@columbia.edu>
// Victor Nwankwo <vtn2106@cumc.columbia.edu>
// Joe Romano <jdr2160@cumc.columbia.edu>
// Ram Vanguri <rami.vanguri@columbia.edu>
// Nicholas P. Tatonetti <nick.tatonetti@columbia.edu>
// All rights reserved.

// This site is released under a CC BY-NC-SA 4.0 license.
// For full license details see LICENSE.txt at 
// https://github.com/tatonetti-lab/nsides or go to:
// http://creativecommons.org/licenses/by-nc-sa/4.0/

class NsidesApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drugs: '',
            outcome: '',
            numOutcomeResults: 'all',
            outcomeOptions: [],
            submitNewModelOption: ''
        };
    }

    render() {
        console.log("STATE: ");
        console.log(this.state);
        return <div>
            <div className='select-row'>
                <section>
                    <DrugSelectBox
                        numOutcomeResults={this.state.numOutcomeResults}
                        onDrugChange={(newDrug, topOutcomes, drugHasNoModel) => this.handleDrugChange(newDrug, topOutcomes, drugHasNoModel)}
                    />
                    <EffectSelectBox
                        outcomeOptions={this.state.outcomeOptions}
                        outcome={this.state.outcome}
                        selectedDrug={this.state.drugs}
                        onDrugOutcomeChange={(newDrug, newOutcome) => this.handleDrugOutcomeChange(newDrug, newOutcome)}
                    />
                </section>
            </div>
            {this.state.submitNewModelOption !== '' &&
                <div className="newModelNotification">
                    <p>We have not yet generated a model for this drug / drug combination.</p>
                    <p>If you would like to submit this drug for computation, click on the following button:</p>
                    <SubmitModelButton
                        drugName={this.state.submitNewModelOption}
                    />
                </div>
            }
        </div>;
    }

    handleDrugChange(newDrug, topOutcomes, drugHasNoModel) {
        this.setState({
            drugs: newDrug,
            outcome: '',
            submitNewModelOption: drugHasNoModel,
            outcomeOptions: topOutcomes
        }, () => {
            if (this.state.submitNewModelOption !== '') {
                var title1 = '';
            } else {
                var title1 = "Select a drug and effect";
            }
            drawTimeSeriesGraph([], title1, dateformat, blank = true);
        });
    }

    handleDrugOutcomeChange(newDrug, newOutcome) {
        this.setState({
            drugs: newDrug,
            outcome: newOutcome
        }, () => {
            debug("newDrug", newDrug, "newOutcome", newOutcome)
            if ((newDrug == "") || (newOutcome == "")) {
                if (this.state.submitNewModelOption !== '') {
                    title1 = "";
                } else {
                    title1 = "Select a drug and effect";
                }
                drawTimeSeriesGraph([], title1, dateformat, blank = true);
            }

            else {
                // Fetch from nsides API
                var api_call = "/api/v1/query?service=nsides&meta=estimateForDrug_Outcome&drugs=" + newDrug + "&outcome=" + newOutcome;

                request = fetch(api_call) // http://stackoverflow.com/a/41059178
                    .then(function (response) {
                        // Convert to JSON
                        return response.json();
                    })
                    .then(function (j) {
                        var data = j["results"][0]["estimates"];
                        debug("drug-effect data", data);

                        /* Set variables */
                        var data1 = data;
                        console.log("DATA1:");
                        console.log(data1);
                        var title1 = "Proportional Reporting Ratio over time";
                        drawTimeSeriesGraph(data1, title1, dateformat);
                    })
                    .catch(function (ex) {
                        debug('Parsing failed', ex);
                        request = null;
                        var title1 = "Select a drug and effect"; //"No results found";
                        drawTimeSeriesGraph([], title1, dateformat, blank = true);
                    })

            }
        });
    }

}

ReactDOM.render(<NsidesApp />, document.getElementById("container"))
