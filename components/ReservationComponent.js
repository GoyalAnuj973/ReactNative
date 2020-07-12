import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Picker,
  Switch,
  Button,
  Modal,
  Alert
} from "react-native";
import * as Animatable from 'react-native-animatable';
import DatePicker from "react-native-datepicker";
import { Permissions, Notifications, Calendar } from 'expo';

const styles = StyleSheet.create({
  formRow: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    margin: 20,
  },
  // Note formLabel and formItem will be inside formRow
  // so the flexDirection will be row, and formLabel will be 2x size formItem
  formLabel: {
    fontSize: 18,
    flex: 2,
  },
  formItem: {
    flex: 1,
  },
});
class Reservation extends Component {
    static navigationOptions = {
      title: 'Reserve Table',
    }

    static defaultState() {
      return ({
        guests: 1,
        smoking: false,
        date: '',
      });
    }

    static async obtainNotificationPermission() {
      let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
      if (permission.status !== 'granted') {
        permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if (permission.status !== 'granted') {
          Alert.alert('Permission not granted to show notifications');
        }
      }
      return permission;
    }

    static async obtainCalendarPermission() {
      let permission = await Permissions.getAsync(Permissions.CALENDAR);
      if (permission.status !== 'granted') {
        permission = await Permissions.askAsync(Permissions.CALENDAR);
        if (permission.status !== 'granted') {
          Alert.alert('Permission not granted to access the calendar');
        }
      }
      return permission;
    }

    static async presentLocalNotification(date) {
      await Reservation.obtainNotificationPermission();
      Notifications.presentLocalNotificationAsync({
        title: 'Your Reservation',
        body: `Reservation for ${date} requested`,
        ios: {
          sound: true,
        },
        android: {
          sound: true,
          vibrate: true,
          color: '#512DA8',
        },
      });
    }

    static async addReservationToCalendar(date) {
      await Reservation.obtainCalendarPermission();
      const startDate = new Date(Date.parse(date));
      const endDate = new Date(Date.parse(date) + (2 * 60 * 60 * 1000)); // 2 hours
      Calendar.createEventAsync(
        Calendar.DEFAULT,
        {
          title: 'Con Fusion Table Reservation',
          location: '121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong',
          startDate,
          endDate,
          timeZone: 'Asia/Hong_Kong',
        },
      );
      Alert.alert('Reservation has been added to your calendar');
    }

    constructor(props) {
      super(props);
      this.state = Reservation.defaultState();
    }

    resetForm() {
      this.setState(Reservation.defaultState());
    }

    confirmReservation(date) {
      Reservation.presentLocalNotification(date);
      Reservation.addReservationToCalendar(date);
      this.resetForm();
    }

    handleReservation() {
      const { date, guests, smoking } = this.state;

      Alert.alert(
        'Your Reservation OK?',
        `Number of guests: ${guests}\nSmoking? ${smoking ? 'Yes' : 'No'}\nDate and Time:${date}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => this.resetForm(),
          },
          {
            text: 'OK',
            // eslint-disable-next-line no-confusing-arrow, no-console
            onPress: () => this.confirmReservation(date),
          },
        ],
        { cancelable: false },
      );
    }

    render() {
      const todayDate = new Date().toISOString().split('T')[0];
      const {
        date,
        guests,
        smoking,
      } = this.state;

      return (
        <Animatable.View animation="zoomIn" duration={2000}>
          <ScrollView>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Number of Guests</Text>
              <Picker
                style={styles.formItem}
                selectedValue={guests}
                onValueChange={itemValue => this.setState({ guests: itemValue })}
              >
                <Picker.Item label="1" value="1" />
                <Picker.Item label="2" value="2" />
                <Picker.Item label="3" value="3" />
                <Picker.Item label="4" value="4" />
                <Picker.Item label="5" value="5" />
                <Picker.Item label="6" value="6" />
              </Picker>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
              <Switch
                style={styles.formItem}
                value={smoking}
                trackColor="#512DA8"
                onValueChange={value => this.setState({ smoking: value })}
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Date and Time</Text>
              <DatePicker
                style={{ flex: 2, marginRight: 20 }}
                date={date}
                format=""
                mode="datetime"
                placeholder="Select Date and Time"
                minDate={todayDate}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    marginLeft: 0,
                  },
                  dateInput: {
                    marginLeft: 36,
                  },
                }}
                onDateChange={newDate => this.setState({ date: newDate })}
              />
            </View>
            <View style={styles.formRow}>
              <Button
                title="Reserve"
                color="#512DA8"
                onPress={() => this.handleReservation()}
                accessibilityLabel="Learn more about this purple button"
              />
            </View>
          </ScrollView>
        </Animatable.View>
      );
    }
}

export default Reservation;
/*class Reservation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      guests: 1,
      smoking: false,
      date: "",
      showModal: false
    };
  }

  static navigationOptions = {
    title: "Reserve Table"
  };

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleReservation() {
    console.log(JSON.stringify(this.state));
    let message = 'Number of Guests: ' + this.state.guests
                    '\nSmoking? ' + this.state.smoking + 
                    '\nDate and Time: ' + this.state.date;
    Alert.alert(
      'Your Reservation OK?',
      message,
      [
        {text: 'Cancel', onPress: () => {
            console.log("Reservation Cancelled");
            this.resetForm();
          }, style: 'cancel'
        },
        {text: 'OK', onPress: () => {
          this.presentLocalNotification(this.state.date);
          this.resetForm();
          }
        }
      ],
      { cancelable: false}
    );
    this.toggleModal();
  }

  resetForm() {
    this.setState({
      guests: 1,
      smoking: false,
      date: "",
      showModal: false
    });
  }

  async obtainNotificationPermission() {
    let permission = await Permissions.getAsync(Permissions.USER_FACING_NOTIFICATIONS);
    if (permission.status !== 'granted') {
        permission = await Permissions.askAsync(Permissions.USER_FACING_NOTIFICATIONS);
        if (permission.status !== 'granted') {
            Alert.alert('Permission not granted to show notifications');
        }
    }
    return permission;
  }

  async presentLocalNotification(date) {
    await this.obtainNotificationPermission();
    Notifications.presentLocalNotificationAsync({
        title: 'Your Reservation',
        body: 'Reservation for '+ date + ' requested',
        ios: {
            sound: true
        },
        android: {
            sound: true,
            vibrate: true,
            color: '#512DA8'
        }
    });
  }

  render() {
    return (
      <ScrollView>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Number of Guests</Text>
          <Picker
            style={styles.formItem}
            selectedValue={this.state.guests}
            onValueChange={(itemValue, itemIndex) =>
              this.setState({ guests: itemValue })
            }
          >
            <Picker.Item label="1" value="1" />
            <Picker.Item label="2" value="2" />
            <Picker.Item label="3" value="3" />
            <Picker.Item label="4" value="4" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="6" value="6" />
          </Picker>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
          <Switch
            style={styles.formItem}
            value={this.state.smoking}
            onTintColor="#512DA8"
            onValueChange={value => this.setState({ smoking: value })}
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Date and Time</Text>
          <DatePicker
            style={{ flex: 2, marginRight: 20 }}
            date={this.state.date}
            format=""
            mode="datetime"
            placeholder="select date and Time"
            minDate="2017-01-01"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            customStyles={{
              dateIcon: {
                position: "absolute",
                left: 0,
                top: 4,
                marginLeft: 0
              },
              dateInput: {
                marginLeft: 36
              }
              // ... You can check the source to find the other keys.
            }}
            onDateChange={date => {
              this.setState({ date: date });
            }}
          />
        </View>
        <View style={styles.formRow}>
          <Button
            onPress={() => this.handleReservation()}
            title="Reserve"
            color="#512DA8"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => this.toggleModal()}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Your Reservation</Text>
            <Text style={styles.modalText}>
              Number of Guests: {this.state.guests}
            </Text>
            <Text style={styles.modalText}>
              Smoking?: {this.state.smoking ? "Yes" : "No"}
            </Text>
            <Text style={styles.modalText}>
              Date and Time: {this.state.date}
            </Text>

            <Button
              onPress={() => {
                this.toggleModal();
                this.resetForm();
              }}
              color="#512DA8"
              title="Close"
            />
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20
  },
  formLabel: {
    fontSize: 18,
    flex: 2
  },
  formItem: {
    flex: 1
  },
  modal: {
    justifyContent: "center",
    margin: 20
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20
  },
  modalText: {
    fontSize: 18,
    margin: 10
  }
});

export default Reservation;*/



/*import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, Picker, Switch, Button, Modal } from 'react-native';
import { Card } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'

class Reservation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            guests: 1,
            smoking: false,
            date: '',
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Reserve Table',
    };

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleReservation() {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
    }

    resetForm() {
        this.setState({
            guests: 1,
            smoking: false,
            date: ''
        });
    }
    
    render() {
        return(
            <ScrollView>
                <View style={styles.formRow}>
                <Text style={styles.formLabel}>Number of Guests</Text>
                <Picker
                    style={styles.formItem}
                    selectedValue={this.state.guests}
                    onValueChange={(itemValue, itemIndex) => this.setState({guests: itemValue})}>
                    <Picker.Item label="1" value="1" />
                    <Picker.Item label="2" value="2" />
                    <Picker.Item label="3" value="3" />
                    <Picker.Item label="4" value="4" />
                    <Picker.Item label="5" value="5" />
                    <Picker.Item label="6" value="6" />
                </Picker>
                </View>
                <View style={styles.formRow}>
                <Text style={styles.formLabel}>Smoking/Non-Smoking?</Text>
                <Switch
                    style={styles.formItem}
                    value={this.state.smoking}
                    onTintColor='#512DA8'
                    onValueChange={(value) => this.setState({smoking: value})}>
                </Switch>
                </View>
                <View style={styles.formRow}>
                <Text style={styles.formLabel}>Date and Time</Text>
                <DatePicker
                    style={{flex: 2, marginRight: 20}}
                    date={this.state.date}
                    format=''
                    mode="datetime"
                    placeholder="select date and Time"
                    minDate="2017-01-01"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                    dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 0
                    },
                    dateInput: {
                        marginLeft: 36
                    }
                    // ... You can check the source to find the other keys. 
                    }}
                    onDateChange={(date) => {this.setState({date: date})}}
                />
                </View>
                <View style={styles.formRow}>
                <Button
                    onPress={() => this.handleReservation()}
                    title="Reserve"
                    color="#512DA8"
                    accessibilityLabel="Learn more about this purple button"
                    />
                </View>
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => {this.toggleModal(); this.resetForm()}}
                    onRequestClose = {() => {this.toggleModal(); this.resetForm()}}>
                    <View style = {styles.modal}>
                        <Text style = {styles.modalTitle}>Your Reservation</Text>
                        <Text style = {styles.modalText}>Number of Guests: {this.state.guests}</Text>
                        <Text style = {styles.modalText}>Smoking?: {this.state.smoking ? 'Yes' : 'No'}</Text>
                        <Text style = {styles.modalText}>Date and Time: {this.state.date}</Text>
                        
                        <Button 
                            onPress = {() =>{this.toggleModal(); this.resetForm();}}
                            color="#512DA8"
                            title="Close" 
                            />
                    </View>
                </Modal>
            </ScrollView>
        );
    }

};

const styles = StyleSheet.create({
    formRow: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      margin: 20
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalTitle: {
         fontSize: 24,
         fontWeight: 'bold',
         backgroundColor: '#512DA8',
         textAlign: 'center',
         color: 'white',
         marginBottom: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     }
});

export default Reservation;*/